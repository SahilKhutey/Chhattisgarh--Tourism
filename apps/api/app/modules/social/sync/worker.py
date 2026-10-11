from __future__ import annotations

import logging
from typing import Any

from sqlalchemy.orm import Session

from app.modules.social.domain.errors import (
    CircuitBreakerOpenError,
    SocialSyncLockConflictError,
    SyncAlreadyRunningError,
)
from app.modules.social.sync.coordinator import SocialSyncCoordinator
from app.modules.social.sync.events import SocialSyncRequested
from app.modules.social.sync.state import SyncResult

logger = logging.getLogger(__name__)


class SocialSyncWorker:
    """Worker processing background social synchronization requests."""

    def __init__(self, session_or_coordinator: Session | SocialSyncCoordinator) -> None:
        if isinstance(session_or_coordinator, Session):
            self.coordinator = SocialSyncCoordinator(session_or_coordinator)
        else:
            self.coordinator = session_or_coordinator

    def handle(self, event: SocialSyncRequested) -> SyncResult:
        logger.info(
            "Worker processing sync request for account %s (platform=%s, trigger=%s)",
            event.account_id,
            event.platform,
            event.reason,
        )

        try:
            return self.coordinator.sync_account(
                account_id=event.account_id,
                trigger=event.reason,
                force=event.force,
                requested_by=event.requested_by,
            )
        except (SyncAlreadyRunningError, SocialSyncLockConflictError) as lock_err:
            logger.info("Worker skipped sync for %s (already running): %s", event.account_id, lock_err)
            return SyncResult(
                account_id=event.account_id,
                status="SKIPPED",
                error=f"Sync currently in progress: {lock_err}",
            )
        except CircuitBreakerOpenError as cb_err:
            logger.warning("Worker skipped sync for %s (circuit breaker open): %s", event.account_id, cb_err)
            return SyncResult(
                account_id=event.account_id,
                status="BLOCKED",
                error=f"Circuit breaker open: {cb_err}",
            )


__all__ = ["SocialSyncWorker"]
