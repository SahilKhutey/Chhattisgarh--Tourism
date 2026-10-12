import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from unittest.mock import MagicMock
import pytest

from app.modules.social.domain.enums import (
    ContentType,
    CreatorStatus,
    ProviderAccessStatus,
    SocialAccountStatus,
    SocialPlatform,
    SyncStatus,
)
from app.modules.social.domain.errors import (
    SocialSyncLockConflictError,
    SyncAlreadyRunningError,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.sync_state import SocialAccountSyncState
from app.modules.social.providers.base import NormalizedSocialItem, SyncResult as ProviderSyncResult
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.sync.coordinator import SocialSyncCoordinator
from app.modules.social.sync.locking import InMemorySocialSyncLock


def test_concurrent_sync_locking(session):
    creator = Creator(
        id=uuid.uuid4(),
        display_name="Ravi Bastar",
        slug="ravi-bastar",
        status=CreatorStatus.ACTIVE.value,
        district_id="bastar",
    )
    session.add(creator)

    account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform="youtube",
        handle="bastar_culture",
        profile_url="https://youtube.com/@bastar_culture",
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

    shared_lock = InMemorySocialSyncLock()
    registry = ProviderRegistry([mock_provider])

    # 1. Acquire lock to simulate active in-flight sync
    assert shared_lock.acquire(account.id) is True

    # 2. Assert concurrent callers are rejected while lock is active
    def attempt_blocked_sync():
        coordinator = SocialSyncCoordinator(
            session=session,
            lock=shared_lock,
            provider_registry=registry,
        )
        try:
            coordinator.sync_account(account.id)
            return "success"
        except (SyncAlreadyRunningError, SocialSyncLockConflictError):
            return "conflict"
        except Exception as e:
            return f"error: {type(e).__name__} - {e}"

    with ThreadPoolExecutor(max_workers=9) as executor:
        futures = [executor.submit(attempt_blocked_sync) for _ in range(9)]
        conflicts = [f.result() for f in futures]

    assert len(conflicts) == 9
    assert all(c == "conflict" for c in conflicts), f"Results: {conflicts}"

    # 3. Release lock and verify sync proceeds successfully
    shared_lock.release(account.id)
    coordinator = SocialSyncCoordinator(
        session=session,
        lock=shared_lock,
        provider_registry=registry,
    )
    result = coordinator.sync_account(account.id)
    assert result.status == SyncStatus.SUCCEEDED.value
