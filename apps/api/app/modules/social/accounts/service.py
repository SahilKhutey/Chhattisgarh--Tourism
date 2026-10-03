from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from typing import Any, Sequence

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.publisher import create_outbox_event
from app.events.types import EventType
from app.modules.social.acceptance.service import SocialAcceptanceService
from app.modules.social.accounts.repository import SocialAccountRepository
from app.modules.social.accounts.schemas import (
    AdminCreatorRegister,
    SocialAccountAcceptPayload,
    SocialAccountCreate,
    SocialAccountRegisterRequest,
    SocialAccountUpdate,
)
from app.modules.social.domain.enums import (
    CreatorStatus,
    SocialAccountStatus,
    SocialPlatform,
    SyncHealthStatus,
    SyncStatus,
)
from app.modules.social.domain.state_machines import (
    CreatorStateMachine,
    SocialAccountStateMachine,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.sync_state import SocialAccountSyncState
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.repositories.creator_repository import CreatorRepository
from app.modules.social.source.validator import SourceValidator


class SocialAccountNotFoundError(AppError):
    def __init__(self, account_id: uuid.UUID | str) -> None:
        super().__init__(
            code="SOCIAL_ACCOUNT_NOT_FOUND",
            message=f"Social account '{account_id}' was not found.",
            status_code=404,
        )


class DuplicateSocialAccountError(AppError):
    def __init__(self, platform: str, handle: str) -> None:
        super().__init__(
            code="DUPLICATE_SOCIAL_ACCOUNT",
            message=f"Social account for {platform} with handle '{handle}' is already registered.",
            status_code=409,
        )


class SocialAccountService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.account_repo = SocialAccountRepository(session)
        self.creator_repo = CreatorRepository(session)
        self.acceptance_service = SocialAcceptanceService(session)
        self.provider_registry = ProviderRegistry.default()

    def _normalize_handle(self, handle: str) -> str:
        return re.sub(r"^@", "", handle.strip())

    def register_social_account(
        self,
        creator_id: uuid.UUID,
        payload: SocialAccountCreate | SocialAccountRegisterRequest,
        auto_verify: bool = True,
    ) -> SocialAccount:
        creator = self.creator_repo.get_by_id(creator_id)
        if not creator:
            raise AppError(
                code="CREATOR_NOT_FOUND",
                message=f"Creator '{creator_id}' was not found.",
                status_code=404,
            )

        platform_val = payload.platform.value if hasattr(payload.platform, "value") else str(payload.platform)
        platform_enum = SocialPlatform(platform_val)
        normalized_handle = self._normalize_handle(payload.handle)

        # Validate profile_url if provided
        profile_url = payload.profile_url
        if profile_url:
            validated_source = SourceValidator.validate_platform_url(profile_url, platform_enum)
            profile_url = validated_source.value

        existing = self.account_repo.get_by_platform_and_handle(
            platform=platform_val,
            handle=normalized_handle,
        )
        if existing:
            raise DuplicateSocialAccountError(platform_val, normalized_handle)

        account = SocialAccount(
            creator_id=creator_id,
            platform=platform_val,
            handle=normalized_handle,
            display_name=getattr(payload, "display_name", None),
            profile_url=profile_url,
            account_type=getattr(payload, "account_type", "CREATOR"),
            status=SocialAccountStatus.PENDING.value,
            sync_status=SyncStatus.NEVER_RUN.value,
            is_sync_enabled=True,
            sync_frequency_minutes=getattr(payload, "sync_frequency_minutes", 60),
            priority=getattr(payload, "priority", 50),
            content_types_allowed=getattr(payload, "content_types_allowed", ["VIDEO", "SHORT", "REEL", "POST"]),
            max_items=getattr(payload, "max_items", 30),
            is_featured=getattr(payload, "is_featured", False),
            sync_health=SyncHealthStatus.HEALTHY.value,
        )
        self.account_repo.create(account)

        # Initialize dedicated sync state record if not exists
        sync_state = SocialAccountSyncState(
            social_account_id=account.id,
            sync_status=SyncStatus.NEVER_RUN.value,
            sync_enabled=True,
        )
        self.session.add(sync_state)

        create_outbox_event(
            self.session,
            event_type=EventType.SOCIAL_ACCOUNT_REGISTERED,
            aggregate_id=account.id,
            payload={
                "account_id": str(account.id),
                "creator_id": str(creator_id),
                "platform": account.platform,
                "handle": account.handle,
            },
        )

        if auto_verify:
            self.verify_social_account(account.id)

        self.session.commit()
        return account

    def get_account(self, account_id: uuid.UUID) -> SocialAccount:
        account = self.account_repo.get_by_id(account_id)
        if not account:
            raise SocialAccountNotFoundError(account_id)
        return account

    def list_accounts(
        self,
        creator_id: uuid.UUID | None = None,
        status: str | None = None,
        platform: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Sequence[SocialAccount]:
        if creator_id:
            return self.account_repo.get_by_creator(creator_id)
        return self.account_repo.list_accounts(status=status, platform=platform, limit=limit, offset=offset)

    def verify_social_account(self, account_id: uuid.UUID) -> SocialAccount:
        account = self.get_account(account_id)
        current = SocialAccountStatus(account.status)

        # Transition: PENDING -> VERIFYING
        account.status = SocialAccountStateMachine.transition(current, SocialAccountStatus.VERIFYING).value

        try:
            platform_enum = SocialPlatform(account.platform)
            provider = self.provider_registry.get(platform_enum)
            profile = provider.verify_account(account.handle)

            if profile.is_valid:
                account.status = SocialAccountStateMachine.transition(
                    SocialAccountStatus.VERIFYING,
                    SocialAccountStatus.VERIFIED,
                ).value
                account.metadata_json = {
                    "display_name": profile.display_name,
                    "profile_image_url": profile.profile_image_url,
                    "bio": profile.bio,
                    "followers_or_subscribers": profile.follower_or_subscriber_count,
                    "verified_at": datetime.now(timezone.utc).isoformat(),
                }
            else:
                account.status = SocialAccountStateMachine.transition(
                    SocialAccountStatus.VERIFYING,
                    SocialAccountStatus.REJECTED,
                ).value
                account.last_error = "Handle could not be verified on external platform"
        except Exception as exc:
            account.status = SocialAccountStateMachine.transition(
                SocialAccountStatus.VERIFYING,
                SocialAccountStatus.REJECTED,
            ).value
            account.last_error = f"Verification failed: {str(exc)}"

        self.session.flush()
        return account

    def update_social_account(
        self,
        account_id: uuid.UUID,
        payload: SocialAccountUpdate,
    ) -> SocialAccount:
        account = self.get_account(account_id)
        if payload.display_name is not None:
            account.display_name = payload.display_name
        if payload.is_sync_enabled is not None:
            account.is_sync_enabled = payload.is_sync_enabled
        if payload.sync_frequency_minutes is not None:
            account.sync_frequency_minutes = payload.sync_frequency_minutes
        if payload.priority is not None:
            account.priority = payload.priority
        if payload.content_types_allowed is not None:
            account.content_types_allowed = payload.content_types_allowed
        if payload.max_items is not None:
            account.max_items = payload.max_items
        if payload.is_featured is not None:
            account.is_featured = payload.is_featured

        self.session.commit()
        return account

    def accept_social_account(
        self,
        account_id: uuid.UUID,
        payload: SocialAccountAcceptPayload,
    ) -> SocialAccount:
        return self.acceptance_service.accept(
            account_id=account_id,
            approved_content_types=payload.approved_content_types,
            priority=payload.priority,
        )

    def reject_social_account(
        self,
        account_id: uuid.UUID,
        reason: str | None = None,
    ) -> SocialAccount:
        return self.acceptance_service.reject(account_id=account_id, reason=reason)

    def pause_social_account(self, account_id: uuid.UUID) -> SocialAccount:
        return self.acceptance_service.pause(account_id=account_id)

    def reactivate_social_account(self, account_id: uuid.UUID) -> SocialAccount:
        return self.acceptance_service.reactivate(account_id=account_id)


__all__ = [
    "SocialAccountService",
    "SocialAccountNotFoundError",
    "DuplicateSocialAccountError",
]
