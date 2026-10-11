from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock
import uuid
import pytest

from app.modules.social.domain.enums import (
    CreatorStatus,
    ProviderAccessStatus,
    SocialAccountStatus,
    SocialPlatform,
    SyncStatus,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.sync_state import SocialAccountSyncState
from app.modules.social.providers.base import SyncResult as ProviderSyncResult
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.sync.coordinator import SocialSyncCoordinator
from app.modules.social.sync.events import SocialSyncRequested
from app.modules.social.sync.locking import InMemorySocialSyncLock
from app.modules.social.sync.scheduler import SocialSyncScheduler
from app.modules.social.sync.worker import SocialSyncWorker


@pytest.fixture
def creator(session):
    c = Creator(
        id=uuid.uuid4(),
        display_name="Ravi Bastar",
        slug="ravi-bastar",
        status=CreatorStatus.ACTIVE.value,
        district_id="bastar",
    )
    session.add(c)
    session.commit()
    return c


def test_scheduler_discovers_due_accounts(session, creator):
    now = datetime.now(timezone.utc)

    # 1. Account due in the past
    acc1 = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform="youtube",
        handle="acc_due",
        status=SocialAccountStatus.ACTIVE.value,
        is_sync_enabled=True,
        provider_access_status=ProviderAccessStatus.AVAILABLE.value,
        next_sync_at=now - timedelta(hours=1),
    )
    # 2. Account with next_sync_at = None (never scheduled, due immediately)
    acc2 = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform="youtube",
        handle="acc_none",
        status=SocialAccountStatus.ACTIVE.value,
        is_sync_enabled=True,
        provider_access_status=ProviderAccessStatus.AVAILABLE.value,
        next_sync_at=None,
    )
    # 3. Account scheduled for future (not due)
    acc3 = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform="youtube",
        handle="acc_future",
        status=SocialAccountStatus.ACTIVE.value,
        is_sync_enabled=True,
        provider_access_status=ProviderAccessStatus.AVAILABLE.value,
        next_sync_at=now + timedelta(hours=2),
    )
    session.add_all([acc1, acc2, acc3])
    session.commit()

    scheduler = SocialSyncScheduler(session)
    due = scheduler.find_due_accounts(now=now, limit=10)

    due_handles = [a.handle for a in due]
    assert "acc_due" in due_handles
    assert "acc_none" in due_handles
    assert "acc_future" not in due_handles

    # Enqueue jobs
    enqueued = scheduler.enqueue_due_syncs(limit=10)
    assert enqueued >= 2


def test_worker_handles_sync_and_lock_conflict(session, creator):
    account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform="youtube",
        handle="worker_test",
        profile_url="https://youtube.com/@worker_test",
        status=SocialAccountStatus.ACTIVE.value,
        sync_status=SyncStatus.NEVER_RUN.value,
        is_sync_enabled=True,
        provider_access_status=ProviderAccessStatus.AVAILABLE.value,
    )
    session.add(account)
    state = SocialAccountSyncState(
        social_account_id=account.id,
        sync_status=SyncStatus.NEVER_RUN.value,
        sync_enabled=True,
    )
    session.add(state)
    session.commit()

    mock_provider = MagicMock()
    mock_provider.platform = SocialPlatform.YOUTUBE
    mock_provider.fetch_content.return_value = ProviderSyncResult(items=[], next_cursor=None)
    registry = ProviderRegistry([mock_provider])

    lock = InMemorySocialSyncLock()
    coordinator = SocialSyncCoordinator(
        session=session,
        lock=lock,
        provider_registry=registry,
    )
    worker = SocialSyncWorker(coordinator)

    event = SocialSyncRequested(
        account_id=account.id,
        platform="youtube",
        reason="scheduled",
    )

    # Worker executes sync successfully
    res = worker.handle(event)
    assert res.status == "succeeded"

    # Pre-lock the account to simulate concurrency
    lock.acquire(account.id, ttl_seconds=60)
    res_conflict = worker.handle(event)
    assert res_conflict.status == "SKIPPED"
    assert "currently in progress" in res_conflict.error
