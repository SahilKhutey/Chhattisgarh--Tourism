from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Sequence

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.publisher import create_outbox_event
from app.events.types import EventType
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
from app.modules.social.providers.provider_factory import ProviderFactory
from app.modules.social.repositories.creator_repository import CreatorRepository
from app.modules.social.repositories.social_account_repository import SocialAccountRepository
from app.modules.social.schemas.account_schemas import (
    AdminCreatorRegister,
    SocialAccountAcceptPayload,
    SocialAccountCreate,
    SocialAccountUpdate,
)


class SocialAccountNotFoundError(AppError):
    def __init__(self, account_id: uuid.UUID) -> None:
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

    def register_creator_with_accounts(
        self,
        payload: AdminCreatorRegister,
    ) -> Creator:
        existing = self.creator_repo.get_by_handle(payload.handle)
        if existing:
            raise AppError(
                code="CREATOR_HANDLE_EXISTS",
                message=f"Creator with handle '{payload.handle}' already exists.",
                status_code=409,
            )

        creator = Creator(
            user_id=None,
            handle=payload.handle,
            display_name=payload.display_name,
            bio=payload.bio,
            avatar_url=payload.avatar_url,
            district_id=payload.district_id or "bastar",
            languages=payload.languages,
            categories=payload.categories,
            status=CreatorStatus.ACTIVE.value,
            is_verified=True,
        )
        self.creator_repo.create(creator)

        for acc_in in payload.social_accounts:
            self.add_social_account(creator.id, acc_in)

        self.session.commit()
        return creator

    def add_social_account(
        self,
        creator_id: uuid.UUID,
        payload: SocialAccountCreate,
    ) -> SocialAccount:
        creator = self.creator_repo.get_by_id(creator_id)
        if not creator:
            raise AppError(
                code="CREATOR_NOT_FOUND",
                message=f"Creator '{creator_id}' was not found.",
                status_code=404,
            )

        existing = self.account_repo.get_by_platform_and_handle(
            platform=payload.platform.value,
            handle=payload.handle,
        )
        if existing:
            raise DuplicateSocialAccountError(payload.platform.value, payload.handle)

        account = SocialAccount(
            creator_id=creator_id,
            platform=payload.platform.value if hasattr(payload.platform, "value") else str(payload.platform),
            handle=payload.handle,
            display_name=getattr(payload, "display_name", None),
            external_account_id=getattr(payload, "external_account_id", None),
            profile_url=payload.profile_url,
            account_type=payload.account_type,
            status=SocialAccountStatus.PENDING.value,
            sync_status=SyncStatus.NEVER_RUN.value,
            is_sync_enabled=True,
            sync_frequency_minutes=payload.sync_frequency_minutes,
            priority=payload.priority,
            content_types_allowed=payload.content_types_allowed,
            max_items=payload.max_items,
            is_featured=payload.is_featured,
            sync_health=SyncHealthStatus.HEALTHY.value,
        )
        self.account_repo.create(account)

        # Initialize dedicated sync state record
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

        # Trigger automatic provider verification
        self.verify_social_account(account.id)
        return account


    def verify_social_account(self, account_id: uuid.UUID) -> SocialAccount:
        account = self.account_repo.get_by_id(account_id)
        if not account:
            raise SocialAccountNotFoundError(account_id)

        # State transition: PENDING -> VERIFYING
        account.status = SocialAccountStateMachine.transition(
            SocialAccountStatus(account.status),
            SocialAccountStatus.VERIFYING,
        ).value

        provider = ProviderFactory.get_provider(SocialPlatform(account.platform))
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

        self.session.flush()
        return account

    def accept_social_account(
        self,
        account_id: uuid.UUID,
        payload: SocialAccountAcceptPayload,
    ) -> SocialAccount:
        account = self.account_repo.get_by_id(account_id)
        if not account:
            raise SocialAccountNotFoundError(account_id)

        # Social Acceptance Gate: VERIFIED / PENDING_ACCEPTANCE -> ACCEPTED
        account.status = SocialAccountStateMachine.transition(
            SocialAccountStatus(account.status),
            SocialAccountStatus.ACCEPTED,
        ).value

        if payload.approved_content_types:
            account.content_types_allowed = payload.approved_content_types
        if payload.max_items is not None:
            account.max_items = payload.max_items
        if payload.priority is not None:
            account.priority = payload.priority

        # Auto transition to ACTIVE
        account.status = SocialAccountStateMachine.transition(
            SocialAccountStatus.ACCEPTED,
            SocialAccountStatus.ACTIVE,
        ).value

        create_outbox_event(
            self.session,
            event_type=EventType.SOCIAL_ACCOUNT_ACCEPTED,
            aggregate_id=account.id,
            payload={
                "account_id": str(account.id),
                "creator_id": str(account.creator_id),
                "platform": account.platform,
                "handle": account.handle,
                "priority": account.priority,
            },
        )

        self.session.commit()
        return account

    def activate_social_account(self, account_id: uuid.UUID) -> SocialAccount:
        account = self.account_repo.get_by_id(account_id)
        if not account:
            raise SocialAccountNotFoundError(account_id)

        account.status = SocialAccountStateMachine.transition(
            SocialAccountStatus(account.status),
            SocialAccountStatus.ACTIVE,
        ).value
        account.is_sync_enabled = True

        create_outbox_event(
            self.session,
            event_type=EventType.SOCIAL_ACCOUNT_ACTIVATED,
            aggregate_id=account.id,
            payload={
                "account_id": str(account.id),
                "creator_id": str(account.creator_id),
                "platform": account.platform,
                "handle": account.handle,
            },
        )

        self.session.commit()
        return account

    def pause_social_account(self, account_id: uuid.UUID) -> SocialAccount:
        account = self.account_repo.get_by_id(account_id)
        if not account:
            raise SocialAccountNotFoundError(account_id)

        account.status = SocialAccountStateMachine.transition(
            SocialAccountStatus(account.status),
            SocialAccountStatus.PAUSED,
        ).value
        account.is_sync_enabled = False

        create_outbox_event(
            self.session,
            event_type=EventType.SOCIAL_ACCOUNT_PAUSED,
            aggregate_id=account.id,
            payload={
                "account_id": str(account.id),
                "creator_id": str(account.creator_id),
                "platform": account.platform,
                "handle": account.handle,
            },
        )

        self.session.commit()
        return account


    def update_account_settings(
        self,
        account_id: uuid.UUID,
        payload: SocialAccountUpdate,
    ) -> SocialAccount:
        account = self.account_repo.get_by_id(account_id)
        if not account:
            raise SocialAccountNotFoundError(account_id)

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

    def get_account_health_summary(self) -> dict[str, Any]:
        accounts = self.account_repo.list_accounts(limit=1000)
        total = len(accounts)
        active = sum(1 for a in accounts if a.status == SocialAccountStatus.ACTIVE.value)
        youtube = sum(1 for a in accounts if a.platform == SocialPlatform.YOUTUBE.value)
        instagram = sum(1 for a in accounts if a.platform == SocialPlatform.INSTAGRAM.value)
        errors = sum(1 for a in accounts if a.sync_health == SyncHealthStatus.ERROR.value)

        return {
            "total_accounts": total,
            "active_accounts": active,
            "youtube_count": youtube,
            "instagram_count": instagram,
            "sync_error_count": errors,
        }
