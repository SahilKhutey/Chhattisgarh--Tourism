from __future__ import annotations

from typing import Any

from app.modules.social.domain.enums import ContentType, SocialContentType
from app.modules.social.models.social_account import SocialAccount

MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED = 3
MAX_CONSECUTIVE_FAILURES_BEFORE_QUARANTINE = 5


def is_content_type_allowed(account: SocialAccount, content_type: Any) -> bool:
    """Checks if the given content type is in the account's allowed content types list."""
    if not account.content_types_allowed:
        return True

    val = content_type.value if hasattr(content_type, "value") else str(content_type).upper()
    allowed_upper = [c.upper() for c in account.content_types_allowed]
    return val in allowed_upper


def calculate_retry_backoff_minutes(consecutive_failures: int) -> int:
    """Calculates exponential backoff in minutes based on consecutive failure count."""
    if consecutive_failures <= 0:
        return 0
    return min(60 * 24, 5 * (2 ** (consecutive_failures - 1)))


def should_quarantine_account(consecutive_failures: int) -> bool:
    """Determines whether account should be paused/quarantined due to excessive failures."""
    return consecutive_failures >= MAX_CONSECUTIVE_FAILURES_BEFORE_QUARANTINE


__all__ = [
    "is_content_type_allowed",
    "calculate_retry_backoff_minutes",
    "should_quarantine_account",
    "MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED",
    "MAX_CONSECUTIVE_FAILURES_BEFORE_QUARANTINE",
]
