from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy.orm import Session

from app.events.publisher import create_outbox_event
from app.events.types import EventType
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.sync.coordinator import SocialSyncCoordinator
from app.modules.social.sync.repository import SocialSyncStateRepository
from app.modules.social.sync.state import SyncResult

logger = logging.getLogger(__name__)


class SocialSyncScheduler:
    """Discovers and schedules synchronization for accounts whose schedule has elapsed."""

    def __init__(
        self,
        session: Session,
        coordinator: SocialSyncCoordinator | None = None,
    ) -> None:
        self.session = session
        self.sync_state_repo = SocialSyncStateRepository(session)
        self.coordinator = coordinator or SocialSyncCoordinator(session)

    def find_due_accounts(
        self,
        now: datetime | None = None,
        limit: int = 50,
    ) -> Sequence[SocialAccount]:
        return self.sync_state_repo.find_due_accounts(now=now, limit=limit)

    def enqueue_due_syncs(self, limit: int = 50) -> int:
        now = datetime.now(timezone.utc)
        due_accounts = self.find_due_accounts(now=now, limit=limit)
        enqueued_count = 0

        for account in due_accounts:
            account.last_sync_requested_at = now
            create_outbox_event(
                self.session,
                event_type="SOCIAL_SYNC_JOB_QUEUED",
                aggregate_id=account.id,
                payload={
                    "account_id": str(account.id),
                    "platform": account.platform,
                    "reason": "scheduled",
                },
            )
            enqueued_count += 1

        if enqueued_count > 0:
            self.session.commit()
            logger.info("Enqueued %d due social sync jobs", enqueued_count)

        return enqueued_count

    def run_once(self, limit: int = 50) -> list[SyncResult]:
        due_accounts = self.find_due_accounts(limit=limit)
        results: list[SyncResult] = []

        for account in due_accounts:
            try:
                res = self.coordinator.sync_account(account.id, trigger="scheduled")
                results.append(res)
            except Exception as exc:
                logger.warning("Scheduler failed sync for account %s: %s", account.id, exc)
                results.append(
                    SyncResult(
                        account_id=account.id,
                        status="FAILED",
                        error=str(exc),
                        failed=1,
                    )
                )

        return results


__all__ = ["SocialSyncScheduler"]
