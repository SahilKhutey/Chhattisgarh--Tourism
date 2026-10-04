from __future__ import annotations

from typing import Any

from app.modules.social.domain.enums import CreatorStatus, SocialAccountStatus
from app.modules.social.domain.errors import (
    AccountNotAcceptedError,
    AccountSyncDisabledError,
)


class SocialEligibilityService:
    """Enforces the final sync and display eligibility gates before social content processing."""

    def can_sync(
        self,
        account: Any,
        creator: Any = None,
        engine_enabled: bool = True,
    ) -> bool:
        if not engine_enabled:
            return False

        status_str = getattr(account, "status", None)
        if not status_str:
            return False

        status_val = status_str.value if hasattr(status_str, "value") else str(status_str).lower()
        if status_val != SocialAccountStatus.ACTIVE.value:
            return False

        sync_enabled = getattr(account, "sync_enabled", None)
        if sync_enabled is None:
            sync_enabled = getattr(account, "is_sync_enabled", False)

        if not bool(sync_enabled):
            return False

        if creator is not None:
            c_status_str = getattr(creator, "status", None)
            c_val = c_status_str.value if hasattr(c_status_str, "value") else str(c_status_str or "").upper()
            if c_val not in (CreatorStatus.ACTIVE.value, CreatorStatus.VERIFIED.value):
                return False

        return True

    def can_display(self, account: Any) -> bool:
        status_str = getattr(account, "status", None)
        if not status_str:
            return False
        status_val = status_str.value if hasattr(status_str, "value") else str(status_str).lower()
        return status_val == SocialAccountStatus.ACTIVE.value

    def assert_eligible_for_sync(
        self,
        account: Any,
        creator: Any = None,
        engine_enabled: bool = True,
    ) -> None:
        if not engine_enabled:
            raise AccountSyncDisabledError("Social Engine is globally disabled.")

        status_str = getattr(account, "status", None)
        status_val = status_str.value if hasattr(status_str, "value") else str(status_str or "").lower()

        if status_val != SocialAccountStatus.ACTIVE.value:
            raise AccountNotAcceptedError(
                f"Account is not in ACTIVE state (current: '{status_val}'). Only accepted & activated accounts can sync."
            )

        sync_enabled = getattr(account, "sync_enabled", None)
        if sync_enabled is None:
            sync_enabled = getattr(account, "is_sync_enabled", False)

        if not bool(sync_enabled):
            raise AccountSyncDisabledError("Account synchronization is disabled.")

        if creator is not None:
            c_status_str = getattr(creator, "status", None)
            c_val = c_status_str.value if hasattr(c_status_str, "value") else str(c_status_str or "").upper()
            if c_val not in (CreatorStatus.ACTIVE.value, CreatorStatus.VERIFIED.value):
                raise AccountNotAcceptedError(
                    f"Creator profile '{getattr(creator, 'handle', '')}' is not ACTIVE (current: '{c_val}')."
                )


__all__ = ["SocialEligibilityService"]
