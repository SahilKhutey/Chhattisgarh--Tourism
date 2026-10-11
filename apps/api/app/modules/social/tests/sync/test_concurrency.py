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

    # Mock slow provider fetch to simulate in-flight window
    def slow_fetch(*args, **kwargs):
        time.sleep(0.05)
        return ProviderSyncResult(items=[], next_cursor=None)

    mock_provider = MagicMock()
    mock_provider.platform = SocialPlatform.YOUTUBE
    mock_provider.fetch_content.side_effect = slow_fetch

    shared_lock = InMemorySocialSyncLock()
    registry = ProviderRegistry([mock_provider])

    success_count = 0
    barrier = threading.Barrier(10)

    def attempt_sync():
        barrier.wait()
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

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(attempt_sync) for _ in range(10)]
        results = [f.result() for f in futures]

    successes = [r for r in results if r == "success"]
    conflicts = [r for r in results if r == "conflict"]

    # Exactly 1 must succeed, others must be blocked by the lock
    assert len(successes) == 1, f"Results: {results}"
    assert len(conflicts) == 9, f"Results: {results}"
