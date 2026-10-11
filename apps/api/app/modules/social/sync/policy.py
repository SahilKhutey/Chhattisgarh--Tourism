from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone
from typing import Any

from app.modules.social.domain.enums import (
    ProviderAccessStatus,
    SocialAccountStatus,
)
from app.modules.social.domain.errors import (
    AccountNotAcceptedError,
    AccountSyncDisabledError,
    ProviderAuthorizationError,
)


def calculate_backoff(
    failures: int,
    base_seconds: int = 60,
    max_seconds: int = 21600,
    jitter: bool = True,
) -> int:
    """Calculates exponential backoff in seconds based on consecutive failures."""
    if failures <= 0:
        return 0

    backoff = min(max_seconds, base_seconds * (2 ** (failures - 1)))
    if jitter and backoff > 0:
        jitter_max = min(30, max(1, backoff // 4))
        backoff += random.randint(0, jitter_max)

    return min(max_seconds, backoff)


class SocialSyncPolicy:
    """Centralized fail-closed eligibility policy for Social Engine synchronization."""

    @staticmethod
    def can_sync(account: Any) -> bool:
        """Determines if a social account meets all prerequisites for sync.

        Must satisfy:
        1. Status is ACTIVE.
        2. Sync is enabled.
        3. Provider access is AVAILABLE (or not required).
        """
        if not account:
            return False

        # Status check
        status_val = (
            account.status.value
            if hasattr(account.status, "value")
            else str(account.status).lower()
        )
        if status_val != SocialAccountStatus.ACTIVE.value:
            return False

        # Sync enabled check
        is_enabled = getattr(account, "is_sync_enabled", getattr(account, "sync_enabled", False))
        if not is_enabled:
            return False

        # Provider access check
        prov_status = getattr(account, "provider_access_status", ProviderAccessStatus.AVAILABLE)
        prov_val = (
            prov_status.value
            if hasattr(prov_status, "value")
            else str(prov_status).lower()
        )
        if prov_val not in (ProviderAccessStatus.AVAILABLE.value, ProviderAccessStatus.NOT_REQUIRED.value):
            return False

        return True

    @classmethod
    def assert_sync_allowed(cls, account: Any) -> None:
        """Enforces sync eligibility, raising specific fail-closed domain errors."""
        if not account:
            raise AccountNotAcceptedError("No social account provided.")

        status_val = (
            account.status.value
            if hasattr(account.status, "value")
            else str(account.status).lower()
        )
        if status_val != SocialAccountStatus.ACTIVE.value:
            raise AccountNotAcceptedError(
                f"Account '{getattr(account, 'id', 'unknown')}' status is '{status_val}', "
                f"must be '{SocialAccountStatus.ACTIVE.value}' to sync."
            )

        is_enabled = getattr(account, "is_sync_enabled", getattr(account, "sync_enabled", False))
        if not is_enabled:
            raise AccountSyncDisabledError(
                f"Account '{getattr(account, 'id', 'unknown')}' sync is disabled."
            )

        prov_status = getattr(account, "provider_access_status", ProviderAccessStatus.AVAILABLE)
        prov_val = (
            prov_status.value
            if hasattr(prov_status, "value")
            else str(prov_status).lower()
        )
        if prov_val not in (ProviderAccessStatus.AVAILABLE.value, ProviderAccessStatus.NOT_REQUIRED.value):
            raise ProviderAuthorizationError(
                f"Account '{getattr(account, 'id', 'unknown')}' provider access status is '{prov_val}', "
                f"must be '{ProviderAccessStatus.AVAILABLE.value}'."
            )


class SyncSchedulePolicy:
    """Adaptive sync scheduler calculating the next synchronization timestamp."""

    @staticmethod
    def next_sync_at(
        account: Any,
        state: Any | None = None,
        now: datetime | None = None,
    ) -> datetime:
        now = now or datetime.now(timezone.utc)

        consecutive_failures = 0
        if state is not None:
            consecutive_failures = getattr(state, "consecutive_failures", 0)
        elif account is not None:
            consecutive_failures = getattr(account, "consecutive_failures", 0)

        # On consecutive failure, apply exponential backoff
        if consecutive_failures > 0:
            backoff_secs = calculate_backoff(consecutive_failures, jitter=False)
            return now + timedelta(seconds=backoff_secs)

        # High-priority / Featured accounts: 30 minutes
        if getattr(account, "is_featured", False):
            return now + timedelta(minutes=30)

        # Low-priority accounts (< 30): 6 hours
        priority = getattr(account, "priority", 50)
        if priority < 30:
            return now + timedelta(hours=6)

        # Custom cadence configured on account
        freq_mins = getattr(account, "sync_frequency_minutes", None)
        if freq_mins and freq_mins > 0:
            return now + timedelta(minutes=freq_mins)

        # Default active cadence: 2 hours
        return now + timedelta(hours=2)


__all__ = [
    "SocialSyncPolicy",
    "SyncSchedulePolicy",
    "calculate_backoff",
]
