from __future__ import annotations

from app.modules.social.sync.policies import (
    MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED,
    MAX_CONSECUTIVE_FAILURES_BEFORE_QUARANTINE,
    calculate_retry_backoff_minutes,
    is_content_type_allowed,
    should_quarantine_account,
)
from app.modules.social.sync.service import SocialSyncService
from app.modules.social.sync.state import SocialAccountSyncState, SyncResult

__all__ = [
    "SyncResult",
    "SocialAccountSyncState",
    "SocialSyncService",
    "is_content_type_allowed",
    "calculate_retry_backoff_minutes",
    "should_quarantine_account",
    "MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED",
    "MAX_CONSECUTIVE_FAILURES_BEFORE_QUARANTINE",
]
