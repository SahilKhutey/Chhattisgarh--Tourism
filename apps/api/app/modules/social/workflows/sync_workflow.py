from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.modules.social.accounts.repository import SocialAccountRepository
from app.modules.social.audit.service import SocialAuditService
from app.modules.social.domain.enums import SyncStatus
from app.modules.social.events.definitions import (
    SocialWorkflowEvent,
    SocialWorkflowEventType,
)
from app.modules.social.events.publisher import SocialEventPublisher
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.policies.sync_policy import SocialSyncPolicy
from app.modules.social.sync.coordinator import SocialSyncCoordinator
from app.modules.social.sync.locking import SocialSyncLock, get_social_sync_lock
from app.modules.social.workflows.guards import assert_account_sync_allowed

logger = logging.getLogger(__name__)


def _val(x: Any) -> str:
    return x.value if hasattr(x, "value") else str(x)


class SocialSyncWorkflow:
    """
    Workflow for queuing, locking, executing, and monitoring provider synchronization.
    Sections 9.18, 9.19, 9.20, 9.46, 9.47.
    """

    def __init__(
        self,
        session: Session,
        coordinator: SocialSyncCoordinator | None = None,
        lock: SocialSyncLock | None = None,
        publisher: SocialEventPublisher | None = None,
        audit: SocialAuditService | None = None,
    ) -> None:
        self.session = session
        self.repository = SocialAccountRepository(session)
        self.lock = lock or get_social_sync_lock()
        self.coordinator = coordinator or SocialSyncCoordinator(session=session, lock=self.lock)
        self.publisher = publisher or SocialEventPublisher(session)
        self.audit = audit or SocialAuditService(session)

    def queue_sync(
        self,
        account_id: uuid.UUID,
        actor_id: str | None = None,
        priority: int = 50,
        force: bool = False,
    ) -> dict[str, Any]:
        """
        Asynchronously queues a sync job (Section 9.18).
        Validates state eligibility, writes to outbox, and returns 202 Accepted.
        Does NOT block HTTP request with provider network loop.
        """
        account = self.repository.get_by_id(account_id)
        if not account:
            raise AppError(code="ACCOUNT_NOT_FOUND", message=f"Account '{account_id}' not found", status_code=404)

        if not force:
            assert_account_sync_allowed(account)

        platform_str = _val(account.platform)

        # Check if already running or locked
        if self.lock.is_locked(f"social_sync:{platform_str}:{account.id}"):
            raise AppError(
                code="SYNC_ALREADY_IN_PROGRESS",
                message=f"Synchronization is already in progress for account '{account.id}'",
                status_code=409,
            )

        job_id = uuid.uuid4().hex[:16]

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.SYNC_QUEUED,
            aggregate_type="SocialAccount",
            aggregate_id=str(account.id),
            actor_id=actor_id,
            metadata={
                "job_id": job_id,
                "platform": platform_str,
                "priority": priority,
                "force": force,
            },
        )
        self.publisher.publish(event)
        self.audit.record(
            action="sync.queued",
            target_type="SocialAccount",
            target_id=account.id,
            actor=actor_id,
            details={"job_id": job_id},
        )

        return {
            "status": "queued",
            "account_id": str(account.id),
            "job_id": job_id,
            "message": "Synchronization job queued successfully",
        }

    def execute_sync(
        self,
        account_id: uuid.UUID,
        actor_id: str | None = None,
        limit: int = 50,
    ) -> dict[str, Any]:
        """
        Executes synchronization behind duplicate sync protection (Section 9.47).
        """
        account = self.repository.get_by_id(account_id)
        if not account:
            raise AppError(code="ACCOUNT_NOT_FOUND", message=f"Account '{account_id}' not found", status_code=404)

        assert_account_sync_allowed(account)

        platform_str = _val(account.platform)
        lock_key = f"social_sync:{platform_str}:{account.id}"
        if not self.lock.acquire(lock_key, ttl_seconds=300):
            raise AppError(
                code="SYNC_ALREADY_IN_PROGRESS",
                message=f"Sync already running for account '{account.id}'",
                status_code=409,
            )

        try:
            self.publisher.publish(
                SocialWorkflowEvent(
                    event_type=SocialWorkflowEventType.SYNC_STARTED,
                    aggregate_type="SocialAccount",
                    aggregate_id=str(account.id),
                    actor_id=actor_id,
                    metadata={"platform": platform_str},
                )
            )

            # Delegate to coordinator for provider fetch, normalization, upsert
            result = self.coordinator.sync_account(account, limit=limit)

            is_succeeded = _val(result.status).lower() in ("succeeded", "success")
            event_type = (
                SocialWorkflowEventType.SYNC_COMPLETED
                if is_succeeded
                else SocialWorkflowEventType.SYNC_FAILED
            )
            items_synced = getattr(result, "items_synced", getattr(result, "created", 0) + getattr(result, "updated", 0))
            items_discovered = getattr(result, "items_discovered", getattr(result, "discovered", 0))
            err_msg = getattr(result, "error_message", getattr(result, "error", None))

            self.publisher.publish(
                SocialWorkflowEvent(
                    event_type=event_type,
                    aggregate_type="SocialAccount",
                    aggregate_id=str(account.id),
                    actor_id=actor_id,
                    metadata={
                        "items_discovered": items_discovered,
                        "items_synced": items_synced,
                        "status": _val(result.status),
                        "error": err_msg,
                    },
                )
            )

            self.audit.record(
                action="sync.executed",
                target_type="SocialAccount",
                target_id=account.id,
                actor=actor_id,
                details={
                    "status": _val(result.status),
                    "items_synced": items_synced,
                },
            )

            return {
                "account_id": str(account.id),
                "status": _val(result.status),
                "items_discovered": items_discovered,
                "items_synced": items_synced,
                "error_message": err_msg,
            }

        except Exception as exc:
            # Handle QuotaExceeded specifically (Section 9.46)
            err_str = str(exc)
            if "quota" in err_str.lower():
                meta = account.metadata_json or {}
                # Set 4-hour backoff window
                meta["quota_exceeded_until"] = (datetime.now(timezone.utc) + timedelta(hours=4)).isoformat()
                account.metadata_json = meta
                self.repository.save(account)

            self.publisher.publish(
                SocialWorkflowEvent(
                    event_type=SocialWorkflowEventType.SYNC_FAILED,
                    aggregate_type="SocialAccount",
                    aggregate_id=str(account.id),
                    actor_id=actor_id,
                    metadata={"error": err_str},
                )
            )
            raise
        finally:
            self.lock.release(lock_key)


__all__ = ["SocialSyncWorkflow"]
