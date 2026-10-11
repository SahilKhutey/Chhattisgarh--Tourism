from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock
import pytest

from app.modules.social.domain.enums import (
    ProviderAccessStatus,
    SocialAccountStatus,
)
from app.modules.social.domain.errors import (
    AccountNotAcceptedError,
    AccountSyncDisabledError,
    ProviderAuthorizationError,
)
from app.modules.social.sync.policy import (
    SocialSyncPolicy,
    SyncSchedulePolicy,
    calculate_backoff,
)


def _mock_account(
    status=SocialAccountStatus.ACTIVE,
    sync_enabled=True,
    provider_access=ProviderAccessStatus.AVAILABLE,
    is_featured=False,
    priority=50,
    sync_frequency_minutes=None,
    consecutive_failures=0,
):
    acc = MagicMock()
    acc.id = "test-acc-1"
    acc.status = status
    acc.is_sync_enabled = sync_enabled
    acc.sync_enabled = sync_enabled
    acc.provider_access_status = provider_access
    acc.is_featured = is_featured
    acc.priority = priority
    acc.sync_frequency_minutes = sync_frequency_minutes
    acc.consecutive_failures = consecutive_failures
    return acc


def test_social_sync_policy_can_sync():
    # Eligible account
    acc = _mock_account()
    assert SocialSyncPolicy.can_sync(acc) is True

    # Inactive status -> False
    assert SocialSyncPolicy.can_sync(_mock_account(status=SocialAccountStatus.PENDING)) is False
    assert SocialSyncPolicy.can_sync(_mock_account(status=SocialAccountStatus.REJECTED)) is False
    assert SocialSyncPolicy.can_sync(_mock_account(status=SocialAccountStatus.PAUSED)) is False

    # Sync disabled -> False
    assert SocialSyncPolicy.can_sync(_mock_account(sync_enabled=False)) is False

    # Provider access unavailable -> False
    assert SocialSyncPolicy.can_sync(_mock_account(provider_access=ProviderAccessStatus.EXPIRED)) is False
    assert SocialSyncPolicy.can_sync(_mock_account(provider_access=ProviderAccessStatus.REVOKED)) is False


def test_social_sync_policy_assertions():
    # Eligible account raises nothing
    SocialSyncPolicy.assert_sync_allowed(_mock_account())

    # Not active raises AccountNotAcceptedError
    with pytest.raises(AccountNotAcceptedError):
        SocialSyncPolicy.assert_sync_allowed(_mock_account(status=SocialAccountStatus.PENDING))

    # Disabled sync raises AccountSyncDisabledError
    with pytest.raises(AccountSyncDisabledError):
        SocialSyncPolicy.assert_sync_allowed(_mock_account(sync_enabled=False))

    # Provider expired raises ProviderAuthorizationError
    with pytest.raises(ProviderAuthorizationError):
        SocialSyncPolicy.assert_sync_allowed(_mock_account(provider_access=ProviderAccessStatus.EXPIRED))


def test_calculate_backoff():
    assert calculate_backoff(0) == 0
    assert calculate_backoff(1, base_seconds=60, jitter=False) == 60
    assert calculate_backoff(2, base_seconds=60, jitter=False) == 120
    assert calculate_backoff(3, base_seconds=60, jitter=False) == 240
    assert calculate_backoff(4, base_seconds=60, jitter=False) == 480
    assert calculate_backoff(10, base_seconds=60, max_seconds=3600, jitter=False) == 3600


def test_sync_schedule_policy_next_sync_at():
    now = datetime(2026, 10, 11, 12, 0, 0, tzinfo=timezone.utc)

    # Standard active account: 2 hours cadence
    std_acc = _mock_account()
    next_dt = SyncSchedulePolicy.next_sync_at(std_acc, now=now)
    assert next_dt == now + timedelta(hours=2)

    # Featured account: 30 minutes cadence
    feat_acc = _mock_account(is_featured=True)
    next_dt = SyncSchedulePolicy.next_sync_at(feat_acc, now=now)
    assert next_dt == now + timedelta(minutes=30)

    # Low priority account: 6 hours cadence
    low_acc = _mock_account(priority=20)
    next_dt = SyncSchedulePolicy.next_sync_at(low_acc, now=now)
    assert next_dt == now + timedelta(hours=6)

    # Custom sync frequency (45 mins)
    custom_acc = _mock_account(sync_frequency_minutes=45)
    next_dt = SyncSchedulePolicy.next_sync_at(custom_acc, now=now)
    assert next_dt == now + timedelta(minutes=45)

    # Account with consecutive failure: exponential backoff
    fail_acc = _mock_account(consecutive_failures=2)
    next_dt = SyncSchedulePolicy.next_sync_at(fail_acc, now=now)
    assert next_dt == now + timedelta(seconds=120)
