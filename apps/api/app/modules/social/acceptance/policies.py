from __future__ import annotations

from typing import TYPE_CHECKING, Any

from app.modules.social.domain.enums import SocialAccountStatus
from app.modules.social.domain.errors import (
    AccountNotAcceptedError,
    AccountSyncDisabledError,
)

if TYPE_CHECKING:
    from app.modules.social.models.social_account import SocialAccount


class SocialAcceptancePolicy:
    """Policy rules governing when a social account can enter review, be accepted, or be activated."""

    def can_submit(
        self,
        status: SocialAccountStatus | str,
    ) -> bool:
        s = SocialAccountStatus(status) if isinstance(status, str) else status
        return s == SocialAccountStatus.VERIFIED

    def can_accept(
        self,
        status: SocialAccountStatus | str,
    ) -> bool:
        s = SocialAccountStatus(status) if isinstance(status, str) else status
        return s in (SocialAccountStatus.VERIFIED, SocialAccountStatus.PENDING_ACCEPTANCE)

    def can_activate(
        self,
        status: SocialAccountStatus | str,
        sync_enabled: bool,
    ) -> bool:
        s = SocialAccountStatus(status) if isinstance(status, str) else status
        return (
            s == SocialAccountStatus.ACCEPTED
            and sync_enabled
        )


def can_sync(account: Any) -> bool:
    """
    Central business/security rule:
    Only accounts with status ACTIVE and sync_enabled == True may synchronize.
    All other states fail closed.
    """
    status_str = getattr(account, "status", None)
    if not status_str:
        return False

    status_val = status_str.value if hasattr(status_str, "value") else str(status_str).lower()
    is_active = status_val == SocialAccountStatus.ACTIVE.value

    sync_enabled = getattr(account, "sync_enabled", None)
    if sync_enabled is None:
        sync_enabled = getattr(account, "is_sync_enabled", False)

    return is_active and bool(sync_enabled)


def assert_sync_allowed(account: Any) -> None:
    """
    Enforces fail-closed synchronization check:
    PENDING  -> ❌ AccountNotAcceptedError
    VERIFYING-> ❌ AccountNotAcceptedError
    VERIFIED -> ❌ AccountNotAcceptedError
    ACCEPTED -> ❌ AccountNotAcceptedError (unless activated)
    ACTIVE   -> ✅ (if sync_enabled)
    PAUSED   -> ❌ AccountNotAcceptedError or AccountSyncDisabledError
    REJECTED -> ❌ AccountNotAcceptedError
    """
    status_str = getattr(account, "status", None)
    status_val = status_str.value if hasattr(status_str, "value") else str(status_str or "").lower()

    if status_val != SocialAccountStatus.ACTIVE.value:
        raise AccountNotAcceptedError(
            f"Social account is not active (current status: '{status_val}')."
        )

    sync_enabled = getattr(account, "sync_enabled", None)
    if sync_enabled is None:
        sync_enabled = getattr(account, "is_sync_enabled", False)

    if not sync_enabled:
        raise AccountSyncDisabledError(
            "Social account synchronization is disabled."
        )


__all__ = [
    "SocialAcceptancePolicy",
    "can_sync",
    "assert_sync_allowed",
]
