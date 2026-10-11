from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.events.publisher import create_outbox_event
from app.events.types import EventType
from app.modules.social.accounts.repository import SocialAccountRepository
from app.modules.social.content.normalizer import SocialContentNormalizer
from app.modules.social.content.repository import SocialContentRepository
from app.modules.social.content.service import SocialContentService
from app.modules.social.domain.enums import (
    SocialPlatform,
    SyncHealthStatus,
    SyncStatus,
)
from app.modules.social.domain.errors import (
    AccountNotAcceptedError,
    AccountSyncDisabledError,
    CircuitBreakerOpenError,
    ProviderAuthorizationError,
    SocialSyncLockConflictError,
    SyncAlreadyRunningError,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.sync.circuit_breaker import ProviderCircuitBreaker
from app.modules.social.sync.locking import SocialSyncLock, get_social_sync_lock
from app.modules.social.sync.policy import (
    SocialSyncPolicy,
    SyncSchedulePolicy,
)
from app.modules.social.sync.policies import is_content_type_allowed
from app.modules.social.sync.repository import (
    SocialSyncRunRepository,
    SocialSyncStateRepository,
)
from app.modules.social.sync.state import SyncResult

logger = logging.getLogger(__name__)

STALE_SYNC_TIMEOUT_SECONDS = 1800  # 30 minutes


class SocialSyncCoordinator:
    """Production orchestration layer unifying multi-platform handle synchronization."""

    def __init__(
        self,
        session: Session,
        lock: SocialSyncLock | None = None,
        provider_registry: ProviderRegistry | None = None,
        circuit_breaker: ProviderCircuitBreaker | None = None,
    ) -> None:
        self.session = session
        self.lock = lock or get_social_sync_lock()
        self.provider_registry = provider_registry or ProviderRegistry.default()
        self.circuit_breaker = circuit_breaker or ProviderCircuitBreaker()
        self.account_repo = SocialAccountRepository(session)
        self.sync_state_repo = SocialSyncStateRepository(session)
        self.run_repo = SocialSyncRunRepository(session)
        self.content_service = SocialContentService(session)
        self.content_repo = SocialContentRepository(session)

    def mark_source_unavailable(self, content_id: uuid.UUID) -> None:
        """Flags content whose source disappeared/deleted on provider without hard-deleting."""
        self.content_repo.mark_source_unavailable(content_id)
        self.session.commit()

    def sync_account(
        self,
        account_id: uuid.UUID,
        trigger: str = "manual",
        force: bool = False,
        requested_by: str = "system",
    ) -> SyncResult:
        """Executes synchronization for a single creator social account.

        Coordinates:
        - Distributed lock acquisition
        - DB running status check & stale timeout recovery
        - Fail-closed eligibility policy enforcement
        - Provider circuit breaker check
        - Adapter fetching & content normalization
        - Idempotent upsert & partial success detection
        - Adaptive next-sync scheduling
        - Run history log persistence
        - Outbox event publishing
        """
        started_at = datetime.now(timezone.utc)
        run_id = uuid.uuid4().hex[:16]

        # 1. Distributed lock acquisition
        acquired = self.lock.acquire(account_id, ttl_seconds=300)
        if not acquired:
            logger.warning("Sync lock conflict for account %s (already running)", account_id)
            raise SyncAlreadyRunningError(
                f"Sync is already in progress for account: {account_id}"
            )

        try:
            # 2. Load account and state
            account = self.account_repo.get_by_id(account_id)
            if not account:
                raise ValueError(f"Social account '{account_id}' was not found.")

            # 3. Database running check & stale timeout recovery
            if account.sync_status == SyncStatus.RUNNING.value and not force:
                last_attempt = account.last_attempted_sync
                now = datetime.now(timezone.utc)
                if last_attempt and (now - last_attempt).total_seconds() < STALE_SYNC_TIMEOUT_SECONDS:
                    raise SyncAlreadyRunningError(
                        f"Social account '{account_id}' is actively executing sync."
                    )
                logger.warning("Account %s was stuck in RUNNING state; recovering.", account_id)

            # 4. Eligibility check (fail-closed)
            if not force:
                SocialSyncPolicy.assert_sync_allowed(account)

            # 5. Circuit breaker check
            self.circuit_breaker.assert_can_execute(account.platform)

            # 6. Mark RUNNING in database & record run log
            account.sync_status = SyncStatus.RUNNING.value
            account.last_attempted_sync = started_at
            account.last_sync_requested_at = started_at

            sync_state = self.sync_state_repo.get_or_create(account.id)
            sync_state.sync_status = SyncStatus.RUNNING.value
            sync_state.last_started_at = started_at

            run_log = self.run_repo.record_run(
                account_id=account.id,
                platform=account.platform,
                trigger=trigger,
                status="RUNNING",
                run_id=run_id,
                started_at=started_at,
            )
            self.session.commit()

            # 7. Execute provider content fetch
            platform_enum = SocialPlatform(account.platform)
            provider = self.provider_registry.get(platform_enum)

            creator = self.session.scalar(
                select(Creator).where(Creator.id == account.creator_id)
            )
            district_id = creator.district_id if creator and creator.district_id else "bastar"

            fetch_result = provider.fetch_content(
                handle=account.handle,
                cursor=account.sync_cursor,
                limit=account.max_items,
            )

            discovered_count = len(fetch_result.items)
            created_count = 0
            updated_count = 0
            skipped_count = 0
            failed_count = 0

            for item in fetch_result.items:
                if not is_content_type_allowed(account, item.content_type):
                    skipped_count += 1
                    continue

                try:
                    normalized = SocialContentNormalizer.normalize_provider_content(
                        item=item,
                        platform=platform_enum,
                        creator_id=account.creator_id,
                        social_account_id=account.id,
                        creator_district_id=district_id,
                    )
                    saved, is_new = self.content_service.upsert_synced_content(normalized)
                    if is_new:
                        created_count += 1
                    else:
                        updated_count += 1
                except Exception as item_err:
                    failed_count += 1
                    logger.warning(
                        "Failed to normalize/upsert item %s: %s",
                        getattr(item, "provider_content_id", "unknown"),
                        item_err,
                    )

            finished_at = datetime.now(timezone.utc)

            # 8. Determine final outcome status (Partial vs Succeeded vs Failed)
            if failed_count > 0 and (created_count + updated_count) > 0:
                final_status = SyncStatus.PARTIAL.value
            elif failed_count > 0 and (created_count + updated_count) == 0 and discovered_count > 0:
                final_status = SyncStatus.FAILED.value
            else:
                final_status = SyncStatus.SUCCEEDED.value

            # 9. Update state & schedule
            if final_status in (SyncStatus.SUCCEEDED.value, SyncStatus.PARTIAL.value):
                account.last_successful_sync = finished_at
                account.sync_health = SyncHealthStatus.HEALTHY.value
                account.consecutive_failures = 0
                account.last_error = None
                account.sync_cursor = fetch_result.next_cursor
                self.circuit_breaker.record_success(account.platform)

                if final_status == SyncStatus.PARTIAL.value:
                    self.sync_state_repo.record_sync_partial(
                        account_id=account.id,
                        discovered=discovered_count,
                        created=created_count,
                        updated=updated_count,
                        skipped=skipped_count,
                        failed=failed_count,
                        cursor=fetch_result.next_cursor,
                        started_at=started_at,
                        finished_at=finished_at,
                        error=f"{failed_count} items failed ingestion",
                    )
                else:
                    self.sync_state_repo.record_sync_success(
                        account_id=account.id,
                        discovered=discovered_count,
                        created=created_count,
                        updated=updated_count,
                        skipped=skipped_count,
                        failed=failed_count,
                        cursor=fetch_result.next_cursor,
                        started_at=started_at,
                        finished_at=finished_at,
                    )
            else:
                account.consecutive_failures += 1
                account.sync_health = SyncHealthStatus.ERROR.value
                self.circuit_breaker.record_failure(account.platform)
                self.sync_state_repo.record_sync_failure(
                    account_id=account.id,
                    error=f"All {failed_count} items failed ingestion",
                    started_at=started_at,
                    finished_at=finished_at,
                )

            account.sync_status = final_status
            account.next_sync_at = SyncSchedulePolicy.next_sync_at(account, sync_state, now=finished_at)

            # Update run log
            run_log.status = final_status
            run_log.items_discovered = discovered_count
            run_log.items_created = created_count
            run_log.items_updated = updated_count
            run_log.items_skipped = skipped_count
            run_log.items_failed = failed_count
            run_log.items_synced = created_count + updated_count
            run_log.finished_at = finished_at

            # Publish outbox event
            create_outbox_event(
                self.session,
                event_type=EventType.SOCIAL_SYNC_COMPLETED,
                aggregate_id=account.id,
                payload={
                    "account_id": str(account.id),
                    "creator_id": str(account.creator_id),
                    "platform": account.platform,
                    "status": final_status,
                    "items_discovered": discovered_count,
                    "items_created": created_count,
                    "items_updated": updated_count,
                    "items_skipped": skipped_count,
                    "items_failed": failed_count,
                    "run_id": run_id,
                },
            )
            self.session.commit()

            return SyncResult(
                account_id=account.id,
                status=final_status,
                discovered=discovered_count,
                created=created_count,
                updated=updated_count,
                skipped=skipped_count,
                failed=failed_count,
                next_cursor=fetch_result.next_cursor,
                started_at=started_at,
                finished_at=finished_at,
            )

        except (
            CircuitBreakerOpenError,
            SyncAlreadyRunningError,
            SocialSyncLockConflictError,
            AccountNotAcceptedError,
            AccountSyncDisabledError,
            ProviderAuthorizationError,
        ):
            raise

        except Exception as exc:
            finished_at = datetime.now(timezone.utc)
            logger.exception("Sync failed for account %s: %s", account_id, exc)

            try:
                account = self.account_repo.get_by_id(account_id)
                if account:
                    account.last_attempted_sync = finished_at
                    account.consecutive_failures += 1
                    account.last_error = str(exc)
                    account.sync_status = SyncStatus.FAILED.value
                    account.sync_health = SyncHealthStatus.ERROR.value
                    self.circuit_breaker.record_failure(account.platform, exc)

                    sync_state = self.sync_state_repo.get_by_account_id(account.id)
                    account.next_sync_at = SyncSchedulePolicy.next_sync_at(
                        account, sync_state, now=finished_at
                    )
                    self.sync_state_repo.record_sync_failure(
                        account_id=account.id,
                        error=str(exc),
                        started_at=started_at,
                        finished_at=finished_at,
                    )

                    run_log = self.run_repo.get_by_run_id(run_id)
                    if run_log:
                        run_log.status = "FAILED"
                        run_log.error_message = str(exc)
                        run_log.finished_at = finished_at

                    create_outbox_event(
                        self.session,
                        event_type=EventType.SOCIAL_SYNC_FAILED,
                        aggregate_id=account.id,
                        payload={
                            "account_id": str(account.id),
                            "error": str(exc),
                            "run_id": run_id,
                        },
                    )
                    self.session.commit()
            except Exception as persist_err:
                logger.error("Failed to persist sync error state: %s", persist_err)

            return SyncResult(
                account_id=account_id,
                status="FAILED",
                error=str(exc),
                failed=1,
                started_at=started_at,
                finished_at=finished_at,
            )

        finally:
            self.lock.release(account_id)

    def sync_batch(
        self,
        account_ids: Sequence[uuid.UUID],
        force: bool = False,
    ) -> list[SyncResult]:
        results: list[SyncResult] = []
        for aid in account_ids:
            try:
                res = self.sync_account(aid, force=force)
                results.append(res)
            except Exception as exc:
                logger.warning("Batch sync error for account %s: %s", aid, exc)
                results.append(
                    SyncResult(
                        account_id=aid,
                        status="FAILED",
                        error=str(exc),
                        failed=1,
                    )
                )
        return results


__all__ = ["SocialSyncCoordinator"]
