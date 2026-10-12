from __future__ import annotations

import uuid
from unittest.mock import MagicMock
import pytest
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.models import OutboxEvent
from app.modules.social.domain.enums import CreatorStatus, SocialAccountStatus, SocialPlatform, SyncStatus
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.sync.locking import InMemorySocialSyncLock
from app.modules.social.sync.state import SyncResult
from app.modules.social.workflows.sync_workflow import SocialSyncWorkflow


@pytest.fixture
def active_account(session: Session) -> SocialAccount:
    creator = Creator(
        id=uuid.uuid4(),
        display_name="Kanger Valley Explorer",
        handle="kanger_explorer",
        district_id="bastar",
        status=CreatorStatus.ACTIVE,
    )
    session.add(creator)
    session.flush()

    account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="kangervalley",
        status=SocialAccountStatus.ACTIVE.value,
        is_sync_enabled=True,
    )
    session.add(account)
    session.flush()
    return account


def test_queue_sync_eligibility_failure(session: Session, active_account: SocialAccount) -> None:
    # Disable sync
    active_account.is_sync_enabled = False
    session.flush()

    workflow = SocialSyncWorkflow(session)
    with pytest.raises(AppError) as exc_info:
        workflow.queue_sync(active_account.id)
    assert exc_info.value.code == "SOCIAL_ACCOUNT_SYNC_DISABLED"


def test_queue_sync_success_202(session: Session, active_account: SocialAccount) -> None:
    workflow = SocialSyncWorkflow(session)
    res = workflow.queue_sync(active_account.id, actor_id="admin-001")

    assert res["status"] == "queued"
    assert res["account_id"] == str(active_account.id)
    assert "job_id" in res

    # Verify outbox event
    events = session.query(OutboxEvent).all()
    queued_events = [e for e in events if e.event_type == "social.sync.queued"]
    assert len(queued_events) == 1
    assert queued_events[0].payload["metadata"]["job_id"] == res["job_id"]


def test_queue_sync_concurrency_lock_conflict(session: Session, active_account: SocialAccount) -> None:
    lock = InMemorySocialSyncLock()
    lock_key = f"social_sync:{active_account.platform}:{active_account.id}"
    lock.acquire(lock_key, ttl_seconds=300)

    workflow = SocialSyncWorkflow(session, lock=lock)
    with pytest.raises(AppError) as exc_info:
        workflow.queue_sync(active_account.id)
    assert exc_info.value.code == "SYNC_ALREADY_IN_PROGRESS"


def test_execute_sync_success(session: Session, active_account: SocialAccount) -> None:
    lock = InMemorySocialSyncLock()
    mock_coordinator = MagicMock()
    mock_coordinator.sync_account.return_value = SyncResult(
        account_id=active_account.id,
        status="SUCCEEDED",
        discovered=10,
        created=5,
        updated=3,
        skipped=2,
    )

    workflow = SocialSyncWorkflow(session, coordinator=mock_coordinator, lock=lock)
    result = workflow.execute_sync(active_account.id, actor_id="admin-001")

    assert result["status"].upper() == "SUCCEEDED"
    assert result["items_synced"] == 8

    # Lock must be released
    lock_key = f"social_sync:{active_account.platform}:{active_account.id}"
    assert not lock.is_locked(lock_key)

    # Check outbox events: started + completed
    events = session.query(OutboxEvent).all()
    types = [e.event_type for e in events]
    assert "social.sync.started" in types
    assert "social.sync.completed" in types


def test_execute_sync_quota_error_backoff(session: Session, active_account: SocialAccount) -> None:
    lock = InMemorySocialSyncLock()
    mock_coordinator = MagicMock()
    mock_coordinator.sync_account.side_effect = Exception("YouTube API: quotaExceeded limit reached")

    workflow = SocialSyncWorkflow(session, coordinator=mock_coordinator, lock=lock)
    with pytest.raises(Exception, match="quotaExceeded"):
        workflow.execute_sync(active_account.id)

    # Metadata must have backoff window recorded
    session.refresh(active_account)
    assert "quota_exceeded_until" in (active_account.metadata_json or {})

    # Lock must be released
    lock_key = f"social_sync:{active_account.platform}:{active_account.id}"
    assert not lock.is_locked(lock_key)
