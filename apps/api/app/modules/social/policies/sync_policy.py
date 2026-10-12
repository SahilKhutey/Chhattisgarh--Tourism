from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.modules.social.domain.enums import SocialAccountStatus
from app.modules.social.models.social_account import SocialAccount


class SocialSyncPolicy:
    """
    Central operational sync eligibility policy.
    Rule 1: State drives workflow (UI visibility != sync allowed).
    """

    @staticmethod
    def can_sync(account: SocialAccount) -> bool:
        """
        Sync Eligibility Gate (Section 9.17):
        Backend MUST verify:
        account.status == ACTIVE AND account.sync_enabled == True.
        """
        if account.status != SocialAccountStatus.ACTIVE:
            return False

        if not getattr(account, "sync_enabled", False):
            return False

        if getattr(account, "is_blocked", False):
            return False

        return True

    @staticmethod
    def calculate_backoff_seconds(consecutive_failures: int, base_seconds: int = 60, max_seconds: int = 3600) -> int:
        """Calculates exponential backoff delay based on failure count."""
        if consecutive_failures <= 0:
            return 0
        backoff = base_seconds * (2 ** (consecutive_failures - 1))
        return min(backoff, max_seconds)

    @staticmethod
    def is_quota_limited(account: SocialAccount) -> bool:
        """Checks if account is currently blocked by provider quota backoff."""
        metadata = getattr(account, "metadata_json", {}) or {}
        quota_until_str = metadata.get("quota_exceeded_until")
        if not quota_until_str:
            return False

        try:
            quota_until = datetime.fromisoformat(quota_until_str)
            return datetime.now(timezone.utc) < quota_until
        except (ValueError, TypeError):
            return False


__all__ = ["SocialSyncPolicy"]
