from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.events.publisher import create_outbox_event
from app.modules.social.accounts.repository import SocialAccountRepository
from app.modules.social.config import SocialSettings, get_social_settings
from app.modules.social.content.repository import SocialContentRepository
from app.modules.social.domain.enums import (
    ProviderAccessStatus,
    SocialPlatform,
    SyncStatus,
)
from app.modules.social.eligibility.service import (
    AccountNotAcceptedError,
    SocialEligibilityService,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.providers.instagram.adapter import InstagramAdapter
from app.modules.social.providers.instagram.client import InstagramClient
from app.modules.social.providers.instagram.credentials import (
    InstagramCredentialService,
)
from app.modules.social.providers.instagram.errors import (
    InstagramAuthenticationError,
    InstagramAuthorizationError,
    InstagramProviderError,
    InstagramRateLimitError,
)
from app.modules.social.providers.instagram.mapper import InstagramContentMapper
from app.modules.social.sync.repository import SocialSyncStateRepository
from app.modules.social.sync.retry import retry_with_backoff
from app.modules.social.sync.state import SyncResult

logger = logging.getLogger(__name__)


class InstagramSyncService:
    """Production synchronization service for Instagram creator profiles and media."""

    def __init__(
        self,
        session: Session,
        *,
        client: InstagramClient | None = None,
        provider: InstagramAdapter | None = None,
        account_repository: SocialAccountRepository | None = None,
        sync_repository: SocialSyncStateRepository | None = None,
        content_repository: SocialContentRepository | None = None,
        eligibility_service: SocialEligibilityService | None = None,
        mapper: InstagramContentMapper | None = None,
        settings: SocialSettings | None = None,
        credential_service: InstagramCredentialService | None = None,
        audit_service: Any = None,
    ) -> None:
        self.session = session
        self.settings = settings or get_social_settings()
        self.account_repo = account_repository or SocialAccountRepository(session)
        self.sync_repo = sync_repository or SocialSyncStateRepository(session)
        self.content_repo = content_repository or SocialContentRepository(session)
        self.eligibility_service = eligibility_service or SocialEligibilityService()
        self.mapper = mapper or InstagramContentMapper()
        self.credential_service = credential_service
        self.audit_service = audit_service

        if provider is not None:
            self.provider = provider
            self.client = provider.client or client
        else:
            self.client = client
            self.provider = InstagramAdapter(
                client=client,
                credential_service=credential_service,
            )

    def _resolve_account(self, account_or_id: Any) -> SocialAccount:
        if isinstance(account_or_id, (uuid.UUID, str)):
            acc_id = uuid.UUID(str(account_or_id)) if not isinstance(account_or_id, uuid.UUID) else account_or_id
            account = self.account_repo.get_by_id(acc_id)
            if not account:
                raise ValueError(f"SocialAccount '{account_or_id}' was not found.")
            return account
        return account_or_id

    def _parse_checkpoint(self, cursor: str | None) -> tuple[datetime | None, str | None]:
        if not cursor:
            return None, None
        try:
            data = json.loads(cursor)
            pub_str = data.get("last_seen_published_at")
            media_id = data.get("last_seen_media_id") or data.get("last_seen_provider_content_id")
            pub_dt = datetime.fromisoformat(pub_str) if pub_str else None
            return pub_dt, media_id
        except Exception:
            return None, None

    def _format_checkpoint(self, pub_dt: datetime | None, media_id: str | None) -> str | None:
        if not pub_dt and not media_id:
            return None
        return json.dumps(
            {
                "last_seen_published_at": pub_dt.isoformat() if pub_dt else None,
                "last_seen_media_id": media_id,
            }
        )

    async def sync_account(
        self,
        account_or_id: Any,
        *,
        force: bool = False,
    ) -> SyncResult:
        started_at = datetime.now(timezone.utc)
        account = self._resolve_account(account_or_id)

        # 1. Eligibility Check
        creator_stmt = select(Creator).where(Creator.id == account.creator_id)
        creator = self.session.scalar(creator_stmt)
        creator_district_id = creator.district_id if creator and creator.district_id else "bastar"

        is_eligible = force or self.eligibility_service.can_sync(
            account=account,
            creator=creator,
            engine_enabled=True,
        )
        if not is_eligible:
            raise AccountNotAcceptedError(
                f"Instagram account '{account.id}' ({account.handle}) is not eligible for synchronization."
            )

        # 2. Provider Access Status Check
        meta = dict(account.metadata_json or {})
        ig_meta = dict(meta.get("instagram", {}))
        access_status_str = ig_meta.get("provider_access_status", ProviderAccessStatus.AVAILABLE.value)

        if not force and access_status_str in (
            ProviderAccessStatus.EXPIRED.value,
            ProviderAccessStatus.REVOKED.value,
            ProviderAccessStatus.INVALID.value,
        ):
            error_msg = f"Instagram sync blocked: Provider access status is '{access_status_str}'."
            logger.warning(error_msg)
            finished_at = datetime.now(timezone.utc)
            self.sync_repo.record_sync_failure(
                account_id=account.id,
                error=error_msg,
                started_at=started_at,
                finished_at=finished_at,
            )
            self.session.commit()
            return SyncResult(
                account_id=account.id,
                status=SyncStatus.FAILED.value,
                discovered=0,
                created=0,
                updated=0,
                failed=1,
                error=error_msg,
                started_at=started_at,
                finished_at=finished_at,
            )

        # 3. Sync State Initialization
        sync_state = self.sync_repo.get_or_create(account.id)
        sync_state.last_started_at = started_at
        self.session.flush()

        try:
            # 4. Logical Checkpoint
            last_seen_published_at, last_seen_id = (
                (None, None) if force else self._parse_checkpoint(sync_state.cursor)
            )

            # 5. Paginated Media Discovery via Provider
            max_pages = min(self.settings.social_instagram_max_pages_per_sync, 20)
            max_results = min(self.settings.social_instagram_max_results, 50)
            max_media = min(self.settings.social_instagram_max_media_per_sync, 150)

            collected_media = []
            newest_published_at: datetime | None = None
            newest_media_id: str | None = None
            page_cursor: str | None = None
            hit_checkpoint = False

            for page_idx in range(max_pages):
                async def _fetch_page(c=page_cursor):
                    return await self.provider.fetch_media_page(
                        account,
                        cursor=c,
                        limit=max_results,
                    )

                page_res = await retry_with_backoff(
                    _fetch_page,
                    attempts=self.settings.social_instagram_retry_attempts,
                    base_delay=self.settings.social_instagram_retry_base_delay_seconds,
                )

                if not page_res.items:
                    break

                for media in page_res.items:
                    if len(collected_media) >= max_media:
                        hit_checkpoint = True
                        break

                    # Track newest item seen on first page
                    if newest_published_at is None and media.timestamp:
                        newest_published_at = media.timestamp
                        newest_media_id = media.provider_id

                    # Incremental stop condition
                    if (
                        last_seen_published_at
                        and media.timestamp
                        and media.timestamp <= last_seen_published_at
                    ):
                        hit_checkpoint = True
                        break

                    collected_media.append(media)

                if hit_checkpoint or not page_res.has_next:
                    break

                page_cursor = page_res.next_cursor
                if not page_cursor:
                    break

            # 6. Idempotent Upsert & Editorial Preservation
            discovered_count = len(collected_media)
            created_count = 0
            updated_count = 0
            failed_count = 0

            for media in collected_media:
                try:
                    mapped_content = self.mapper.map(
                        media,
                        creator_id=account.creator_id,
                        social_account_id=account.id,
                        creator_district_id=creator_district_id,
                    )
                    _, is_created = self.content_repo.upsert_provider_content(mapped_content)
                    if is_created:
                        created_count += 1
                    else:
                        updated_count += 1
                except Exception as err:
                    logger.error("Failed mapping/upserting Instagram item %s: %s", media.provider_id, err)
                    failed_count += 1

            finished_at = datetime.now(timezone.utc)

            # 7. Update Checkpoint Cursor
            next_checkpoint_cursor = (
                self._format_checkpoint(newest_published_at, newest_media_id)
                if newest_published_at
                else sync_state.cursor
            )

            # 8. Record Sync Success in Repository
            self.sync_repo.record_sync_success(
                account_id=account.id,
                discovered=discovered_count,
                created=created_count,
                updated=updated_count,
                failed=failed_count,
                cursor=next_checkpoint_cursor,
                started_at=started_at,
                finished_at=finished_at,
            )

            # 9. Outbox & Audit Events
            create_outbox_event(
                self.session,
                event_type="SOCIAL_CONTENT_SYNCED",
                aggregate_id=account.id,
                payload={
                    "account_id": str(account.id),
                    "platform": "instagram",
                    "discovered": discovered_count,
                    "created": created_count,
                    "updated": updated_count,
                    "failed": failed_count,
                },
            )
            create_outbox_event(
                self.session,
                event_type="social.instagram.sync.completed",
                aggregate_id=account.id,
                payload={
                    "account_id": str(account.id),
                    "created": created_count,
                    "updated": updated_count,
                },
            )

            if self.audit_service:
                self.audit_service.record(
                    action="INSTAGRAM_SYNC_COMPLETED",
                    entity_type="social_account",
                    entity_id=account.id,
                    details={
                        "discovered": discovered_count,
                        "created": created_count,
                        "updated": updated_count,
                        "duration_ms": int((finished_at - started_at).total_seconds() * 1000),
                    },
                )

            self.session.commit()

            return SyncResult(
                account_id=account.id,
                status=SyncStatus.SUCCEEDED.value,
                discovered=discovered_count,
                created=created_count,
                updated=updated_count,
                failed=failed_count,
                next_cursor=next_checkpoint_cursor,
                started_at=started_at,
                finished_at=finished_at,
            )

        except InstagramAuthenticationError as auth_err:
            self.session.rollback()
            finished_at = datetime.now(timezone.utc)
            error_msg = f"Instagram authentication failed (token expired/invalid): {auth_err}"
            logger.warning("Marking Instagram account %s access as EXPIRED: %s", account.id, auth_err)

            # Mark provider access status as EXPIRED without deleting account or content
            acc = self.account_repo.get_by_id(account.id) or account
            acc_meta = dict(acc.metadata_json or {})
            acc_ig_meta = dict(acc_meta.get("instagram", {}))
            acc_ig_meta["provider_access_status"] = ProviderAccessStatus.EXPIRED.value
            acc_meta["instagram"] = acc_ig_meta
            acc.metadata_json = acc_meta

            self.sync_repo.record_sync_failure(
                account_id=account.id,
                error=error_msg,
                started_at=started_at,
                finished_at=finished_at,
            )
            self.session.commit()

            return SyncResult(
                account_id=account.id,
                status=SyncStatus.FAILED.value,
                discovered=0,
                created=0,
                updated=0,
                failed=1,
                error=error_msg,
                started_at=started_at,
                finished_at=finished_at,
            )

        except InstagramAuthorizationError as auth_err:
            self.session.rollback()
            finished_at = datetime.now(timezone.utc)
            error_msg = f"Instagram authorization revoked: {auth_err}"
            logger.warning("Marking Instagram account %s access as REVOKED: %s", account.id, auth_err)

            # Mark provider access status as REVOKED without deleting account or content
            acc = self.account_repo.get_by_id(account.id) or account
            acc_meta = dict(acc.metadata_json or {})
            acc_ig_meta = dict(acc_meta.get("instagram", {}))
            acc_ig_meta["provider_access_status"] = ProviderAccessStatus.REVOKED.value
            acc_meta["instagram"] = acc_ig_meta
            acc.metadata_json = acc_meta

            self.sync_repo.record_sync_failure(
                account_id=account.id,
                error=error_msg,
                started_at=started_at,
                finished_at=finished_at,
            )
            self.session.commit()

            return SyncResult(
                account_id=account.id,
                status=SyncStatus.FAILED.value,
                discovered=0,
                created=0,
                updated=0,
                failed=1,
                error=error_msg,
                started_at=started_at,
                finished_at=finished_at,
            )

        except Exception as exc:
            self.session.rollback()
            finished_at = datetime.now(timezone.utc)
            error_msg = str(exc)

            logger.error("Instagram sync failed for account %s: %s", account.id, exc, exc_info=True)
            self.sync_repo.record_sync_failure(
                account_id=account.id,
                error=error_msg,
                started_at=started_at,
                finished_at=finished_at,
            )
            self.session.commit()

            return SyncResult(
                account_id=account.id,
                status=SyncStatus.FAILED.value,
                discovered=0,
                created=0,
                updated=0,
                failed=1,
                error=error_msg,
                started_at=started_at,
                finished_at=finished_at,
            )


__all__ = ["InstagramSyncService"]
