from __future__ import annotations

from app.modules.social.sync.circuit_breaker import (
    CircuitState,
    ProviderCircuitBreaker,
)
from app.modules.social.sync.coordinator import SocialSyncCoordinator
from app.modules.social.sync.events import SocialSyncRequested
from app.modules.social.sync.instagram_sync import InstagramSyncService
from app.modules.social.sync.locking import (
    InMemorySocialSyncLock,
    RedisSocialSyncLock,
    SocialSyncLock,
    get_social_sync_lock,
)
from app.modules.social.sync.policies import (
    MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED,
    MAX_CONSECUTIVE_FAILURES_BEFORE_QUARANTINE,
    calculate_retry_backoff_minutes,
    is_content_type_allowed,
    should_quarantine_account,
)
from app.modules.social.sync.policy import (
    SocialSyncPolicy,
    SyncSchedulePolicy,
    calculate_backoff,
)
from app.modules.social.sync.repository import (
    SocialSyncRunRepository,
    SocialSyncStateRepository,
    SyncStateRepository,
)
from app.modules.social.sync.retry import retry_with_backoff
from app.modules.social.sync.scheduler import SocialSyncScheduler
from app.modules.social.sync.service import SocialSyncService
from app.modules.social.sync.state import SocialAccountSyncState, SyncResult
from app.modules.social.sync.worker import SocialSyncWorker
from app.modules.social.sync.youtube_sync import YouTubeSyncService

__all__ = [
    "SyncResult",
    "SocialAccountSyncState",
    "SocialSyncService",
    "SocialSyncCoordinator",
    "YouTubeSyncService",
    "InstagramSyncService",
    "retry_with_backoff",
    "SocialSyncStateRepository",
    "SyncStateRepository",
    "SocialSyncRunRepository",
    "is_content_type_allowed",
    "calculate_retry_backoff_minutes",
    "should_quarantine_account",
    "MAX_CONSECUTIVE_FAILURES_BEFORE_DEGRADED",
    "MAX_CONSECUTIVE_FAILURES_BEFORE_QUARANTINE",
    "SocialSyncPolicy",
    "SyncSchedulePolicy",
    "calculate_backoff",
    "SocialSyncLock",
    "InMemorySocialSyncLock",
    "RedisSocialSyncLock",
    "get_social_sync_lock",
    "ProviderCircuitBreaker",
    "CircuitState",
    "SocialSyncRequested",
    "SocialSyncWorker",
    "SocialSyncScheduler",
]
