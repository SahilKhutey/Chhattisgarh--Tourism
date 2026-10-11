from __future__ import annotations

import logging
import uuid
from typing import Any, Sequence

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.publisher import create_outbox_event
from app.events.types import EventType
from app.modules.social.accounts.repository import SocialAccountRepository
from app.modules.social.domain.enums import (
    ProviderAccessStatus,
    SocialAccountStatus,
    SocialPlatform,
    SyncHealthStatus,
    SyncStatus,
)
from app.modules.social.domain.errors import SocialAccountAlreadyExistsError
from app.modules.social.handles.validator import SocialHandleValidator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.sync_state import SocialAccountSyncState
from app.modules.social.repositories.creator_repository import CreatorRepository

logger = logging.getLogger(__name__)


class SocialHandleService:
    """Production service for social handle registration, normalization, and deduplication."""

    validator = SocialHandleValidator

    def __init__(self, session: Session) -> None:
        self.session = session
        self.account_repo = SocialAccountRepository(session)
        self.creator_repo = CreatorRepository(session)

    def register(
        self,
        creator_id: uuid.UUID,
        platform: SocialPlatform | str,
        handle: str,
        profile_url: str | None = None,
        sync_enabled: bool = False,
        display_name: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> SocialAccount:
        """Register a creator handle.

        Enforces:
        - Strict normalization and platform syntax validation.
        - Non-existence of duplicate (platform, normalized_handle) across ALL creators.
        - Initial fail-closed state (PENDING, NEVER_RUN).
        - Dedicated SocialAccountSyncState record creation.
        - Outbox event emission.
        """
        if isinstance(platform, str):
            platform = SocialPlatform(platform)

        platform_val = platform.value

        # 1. Normalize and validate syntax
        normalized_handle = SocialHandleValidator.validate(platform, handle)

        # 2. Check creator existence
        creator = self.creator_repo.get_by_id(creator_id)
        if not creator:
            raise AppError(
                code="CREATOR_NOT_FOUND",
                message=f"Creator '{creator_id}' was not found.",
                status_code=404,
            )

        # 3. Duplicate check across platform
        existing = self.account_repo.get_by_platform_and_handle(
            platform=platform_val,
            handle=normalized_handle,
        )
        if existing:
            raise SocialAccountAlreadyExistsError(platform=platform_val, handle=normalized_handle)

        # 4. Canonical profile URL generation if missing
        if not profile_url:
            if platform == SocialPlatform.YOUTUBE:
                profile_url = f"https://www.youtube.com/@{normalized_handle}"
            elif platform == SocialPlatform.INSTAGRAM:
                profile_url = f"https://www.instagram.com/{normalized_handle}/"

        # 5. Persist SocialAccount
        account = SocialAccount(
            creator_id=creator_id,
            platform=platform_val,
            handle=normalized_handle,
            display_name=display_name or normalized_handle,
            profile_url=profile_url,
            status=SocialAccountStatus.PENDING.value,
            sync_status=SyncStatus.NEVER_RUN.value,
            is_sync_enabled=sync_enabled,
            sync_health=SyncHealthStatus.HEALTHY.value,
            provider_access_status=ProviderAccessStatus.AVAILABLE.value,
            metadata_json=metadata or {},
        )
        self.account_repo.create(account)

        # 6. Initialize dedicated sync state
        sync_state = SocialAccountSyncState(
            social_account_id=account.id,
            sync_status=SyncStatus.NEVER_RUN.value,
            sync_enabled=sync_enabled,
        )
        self.session.add(sync_state)
        self.session.flush()

        # 7. Publish outbox event
        create_outbox_event(
            self.session,
            event_type=EventType.SOCIAL_ACCOUNT_REGISTERED,
            aggregate_id=account.id,
            payload={
                "account_id": str(account.id),
                "creator_id": str(creator_id),
                "platform": account.platform,
                "handle": account.handle,
                "profile_url": account.profile_url,
                "sync_enabled": account.is_sync_enabled,
            },
        )

        return account

    def get_handle(self, account_id: uuid.UUID) -> SocialAccount | None:
        return self.account_repo.get_by_id(account_id)

    def get_by_platform_and_handle(
        self,
        platform: SocialPlatform | str,
        handle: str,
    ) -> SocialAccount | None:
        if isinstance(platform, str):
            platform = SocialPlatform(platform)
        normalized = SocialHandleValidator.validate(platform, handle)
        return self.account_repo.get_by_platform_and_handle(platform.value, normalized)

    def list_handles(
        self,
        creator_id: uuid.UUID | None = None,
        platform: SocialPlatform | str | None = None,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Sequence[SocialAccount]:
        if creator_id:
            return self.account_repo.get_by_creator(creator_id)

        plat_str = platform.value if hasattr(platform, "value") else (str(platform) if platform else None)
        return self.account_repo.list_accounts(
            status=status,
            platform=plat_str,
            limit=limit,
            offset=offset,
        )


__all__ = ["SocialHandleService"]
