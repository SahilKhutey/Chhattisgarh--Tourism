from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.events.publisher import create_outbox_event
from app.events.types import EventType
from app.modules.social.acceptance.policies import assert_sync_allowed, can_sync
from app.modules.social.accounts.repository import SocialAccountRepository
from app.modules.social.content.normalizer import SocialContentNormalizer
from app.modules.social.content.service import SocialContentService
from app.modules.social.domain.enums import (
    SocialPlatform,
    SyncHealthStatus,
    SyncStatus,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.sync_state import SocialAccountSyncState
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.sync.policies import (
    MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED,
    is_content_type_allowed,
    should_quarantine_account,
)
from app.modules.social.sync.state import SyncResult

logger = logging.getLogger(__name__)


class SocialSyncService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.account_repo = SocialAccountRepository(session)
        self.content_service = SocialContentService(session)
        self.provider_registry = ProviderRegistry.default()

    def sync_account(self, account_id: uuid.UUID, force: bool = False) -> SyncResult:
        started_at = datetime.now(timezone.utc)
        account = self.account_repo.get_by_id(account_id)
        if not account:
            return SyncResult(
                account_id=account_id,
                status="FAILED",
                error=f"Account '{account_id}' was not found.",
                started_at=started_at,
                finished_at=datetime.now(timezone.utc),
            )

        # 1. Enforce fail-closed acceptance & active sync policy
        if not force and not can_sync(account):
            return SyncResult(
                account_id=account_id,
                status="SKIPPED",
                error=f"Account '{account.id}' is {account.status} (sync_enabled={account.sync_enabled}) and not eligible for sync.",
                started_at=started_at,
                finished_at=datetime.now(timezone.utc),
            )

        try:
            creator_stmt = select(Creator).where(Creator.id == account.creator_id)
            creator = self.session.scalar(creator_stmt)
            district_id = creator.district_id if creator and creator.district_id else "bastar"

            platform_enum = SocialPlatform(account.platform)
            provider = self.provider_registry.get(platform_enum)

            fetch_result = provider.fetch_content(
                handle=account.handle,
                cursor=account.sync_cursor,
                limit=account.max_items,
            )

            discovered_count = len(fetch_result.items)
            created_count = 0
            updated_count = 0
            skipped_count = 0

            for item in fetch_result.items:
                # Check allowed content type
                if not is_content_type_allowed(account, item.content_type):
                    skipped_count += 1
                    continue

                # Normalize to canonical SocialContent
                normalized = SocialContentNormalizer.normalize_provider_content(
                    item=item,
                    platform=platform_enum,
                    creator_id=account.creator_id,
                    social_account_id=account.id,
                    creator_district_id=district_id,
                )

                # Upsert into database
                saved, is_new = self.content_service.upsert_synced_content(normalized)
                if is_new:
                    created_count += 1
                else:
                    updated_count += 1

            finished_at = datetime.now(timezone.utc)

            # Update account sync state
            account.last_successful_sync = finished_at
            account.last_attempted_sync = finished_at
            account.sync_health = SyncHealthStatus.HEALTHY.value
            account.sync_status = SyncStatus.SUCCEEDED.value
            account.consecutive_failures = 0
            account.last_error = None
            account.sync_cursor = fetch_result.next_cursor

            # Update dedicated sync state
            sync_state = self.session.scalar(
                select(SocialAccountSyncState).where(SocialAccountSyncState.social_account_id == account.id)
            )
            if not sync_state:
                sync_state = SocialAccountSyncState(social_account_id=account.id)
                self.session.add(sync_state)

            sync_state.sync_status = SyncStatus.SUCCEEDED.value
            sync_state.sync_enabled = account.sync_enabled
            sync_state.last_synced_at = finished_at
            sync_state.last_successful_sync_at = finished_at
            sync_state.consecutive_failures = 0
            sync_state.last_error = None
            sync_state.cursor = fetch_result.next_cursor
            sync_state.items_synced_total += (created_count + updated_count)

            # Record sync run log
            self.account_repo.record_sync_run(
                account_id=account.id,
                status="SUCCESS",
                items_discovered=discovered_count,
                items_synced=created_count + updated_count,
                started_at=started_at,
                finished_at=finished_at,
            )

            create_outbox_event(
                self.session,
                event_type=EventType.SOCIAL_SYNC_COMPLETED,
                aggregate_id=account.id,
                payload={
                    "account_id": str(account.id),
                    "creator_id": str(account.creator_id),
                    "items_discovered": discovered_count,
                    "items_created": created_count,
                    "items_updated": updated_count,
                    "items_skipped": skipped_count,
                },
            )

            self.session.commit()

            return SyncResult(
                account_id=account.id,
                status="SUCCEEDED",
                discovered=discovered_count,
                created=created_count,
                updated=updated_count,
                skipped=skipped_count,
                next_cursor=fetch_result.next_cursor,
                started_at=started_at,
                finished_at=finished_at,
            )

        except Exception as exc:
            finished_at = datetime.now(timezone.utc)
            logger.exception("Sync failed for account %s: %s", account_id, exc)

            account.last_attempted_sync = finished_at
            account.consecutive_failures += 1
            account.last_error = str(exc)
            account.sync_status = SyncStatus.FAILED.value

            if should_quarantine_account(account.consecutive_failures):
                account.sync_health = SyncHealthStatus.PAUSED.value
                account.sync_enabled = False
            elif account.consecutive_failures >= MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED:
                account.sync_health = SyncHealthStatus.ERROR.value

            sync_state = self.session.scalar(
                select(SocialAccountSyncState).where(SocialAccountSyncState.social_account_id == account.id)
            )
            if sync_state:
                sync_state.sync_status = SyncStatus.FAILED.value
                sync_state.last_synced_at = finished_at
                sync_state.consecutive_failures = account.consecutive_failures
                sync_state.last_error = str(exc)
                if should_quarantine_account(account.consecutive_failures):
                    sync_state.sync_enabled = False

            self.account_repo.record_sync_run(
                account_id=account.id,
                status="FAILED",
                items_discovered=0,
                items_synced=0,
                started_at=started_at,
                finished_at=finished_at,
                error_message=str(exc),
            )

            create_outbox_event(
                self.session,
                event_type=EventType.SOCIAL_SYNC_FAILED,
                aggregate_id=account.id,
                payload={
                    "account_id": str(account.id),
                    "error": str(exc),
                    "consecutive_failures": account.consecutive_failures,
                },
            )

            self.session.commit()

            return SyncResult(
                account_id=account.id,
                status="FAILED",
                error=str(exc),
                failed=1,
                started_at=started_at,
                finished_at=finished_at,
            )

    def sync_all_active_accounts(self, limit: int | None = None) -> list[SyncResult]:
        accounts = self.account_repo.list_active_accounts_for_sync()
        if limit:
            accounts = accounts[:limit]

        results: list[SyncResult] = []
        for account in accounts:
            res = self.sync_account(account.id)
            results.append(res)
        return results


__all__ = ["SocialSyncService"]
