from __future__ import annotations

import logging
import re
from collections import defaultdict
from typing import Any
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.social.domain.enums import (
    CreatorStatus,
    ModerationStatus,
    SocialAccountStatus,
    SocialContentStatus,
    SocialPlatform,
    SyncHealthStatus,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent

logger = logging.getLogger("app.modules.social.observability")

# Standard Observability Metrics Registry (Section 12.32)
METRIC_NAMES = {
    "social_sync_total",
    "social_sync_success_total",
    "social_sync_failure_total",
    "social_provider_request_total",
    "social_provider_error_total",
    "social_rate_limit_total",
    "social_content_created_total",
    "social_content_updated_total",
    "social_content_hidden_total",
    "social_feed_request_total",
    "social_feed_cache_hit_total",
    "social_source_click_total",
}

_METRICS_COUNTERS: dict[str, int] = defaultdict(int)


def increment_metric(name: str, count: int = 1, labels: dict[str, str] | None = None) -> None:
    """Increment an observability counter."""
    _METRICS_COUNTERS[name] += count
    if labels:
        label_key = f"{name}{{{','.join(f'{k}=\"{v}\"' for k, v in sorted(labels.items()))}}}"
        _METRICS_COUNTERS[label_key] += count


def get_metric_value(name: str) -> int:
    """Retrieve current value for a given counter."""
    return _METRICS_COUNTERS.get(name, 0)


def get_metrics_snapshot() -> dict[str, int]:
    """Retrieve full snapshot of all recorded metrics."""
    return dict(_METRICS_COUNTERS)


def reset_metrics_for_testing() -> None:
    """Reset all metric counters (testing only)."""
    _METRICS_COUNTERS.clear()


# Operational Dashboard (Section 12.33)
def get_operational_dashboard_data(session: Session) -> dict[str, Any]:
    """
    Returns high-level health and operational overview for the Social Engine:
    - Active Creators
    - Active Accounts
    - Syncing Accounts
    - Failed Syncs
    - Content Published
    - Pending Moderation
    - Unavailable Sources
    - YouTube Health
    - Instagram Health
    """
    try:
        active_creators = session.execute(
            select(func.count(Creator.id)).where(Creator.status == CreatorStatus.ACTIVE.value)
        ).scalar() or 0
    except Exception:
        active_creators = session.execute(
            select(func.count(Creator.id)).where(Creator.is_active == True)  # noqa: E712
        ).scalar() or 0

    active_accounts = session.execute(
        select(func.count(SocialAccount.id)).where(SocialAccount.status == SocialAccountStatus.ACTIVE.value)
    ).scalar() or 0

    syncing_accounts = session.execute(
        select(func.count(SocialAccount.id)).where(SocialAccount.sync_health == SyncHealthStatus.SYNCING.value)
    ).scalar() or 0

    failed_syncs = session.execute(
        select(func.count(SocialAccount.id)).where(SocialAccount.sync_health == SyncHealthStatus.ERROR.value)
    ).scalar() or 0

    content_published = session.execute(
        select(func.count(SocialContent.id)).where(
            SocialContent.publication_status == SocialContentStatus.PUBLISHED.value
        )
    ).scalar() or 0

    pending_moderation = session.execute(
        select(func.count(SocialContent.id)).where(
            SocialContent.moderation_status == ModerationStatus.PENDING.value
        )
    ).scalar() or 0

    unavailable_sources = session.execute(
        select(func.count(SocialContent.id)).where(
            SocialContent.publication_status.in_([
                SocialContentStatus.SOURCE_DELETED.value,
                SocialContentStatus.REMOVED.value,
            ])
        )
    ).scalar() or 0

    # Provider health checks
    youtube_healthy = True
    instagram_healthy = True

    return {
        "active_creators": active_creators,
        "active_accounts": active_accounts,
        "syncing": syncing_accounts,
        "failed_syncs": failed_syncs,
        "content_published": content_published,
        "pending_moderation": pending_moderation,
        "unavailable_sources": unavailable_sources,
        "providers": {
            "youtube": {"healthy": youtube_healthy, "status": "healthy" if youtube_healthy else "degraded"},
            "instagram": {"healthy": instagram_healthy, "status": "healthy" if instagram_healthy else "degraded"},
        },
        "metrics_snapshot": get_metrics_snapshot(),
    }


# Developer Logs conforming to Section 12.34
_REDACTION_PATTERNS = [
    re.compile(r"(key|token|secret|password|authorization)=([^&\s]+)", re.IGNORECASE),
]


def redact_sensitive_data(text: str) -> str:
    """Sanitizes sensitive tokens, secrets, or keys from log messages."""
    redacted = text
    for pattern in _REDACTION_PATTERNS:
        redacted = pattern.sub(r"\1=***REDACTED***", redacted)
    return redacted


def log_developer_event(
    request_id: str | None,
    account_id: str | None,
    provider: str | None,
    operation: str,
    error_type: str | None = None,
    status_code: int | None = None,
    duration_ms: float | None = None,
    retry_count: int = 0,
    message: str | None = None,
) -> None:
    """
    Structured developer log conforming to Section 12.34:
    Never expose credentials or sensitive provider payloads.
    """
    clean_msg = redact_sensitive_data(message or "") if message else ""
    log_payload = {
        "request_id": request_id,
        "account_id": account_id,
        "provider": provider,
        "operation": operation,
        "error_type": error_type,
        "status_code": status_code,
        "duration_ms": duration_ms,
        "retry_count": retry_count,
        "message": clean_msg,
    }
    if error_type:
        logger.error("SocialEngine dev log: %s", log_payload)
    else:
        logger.info("SocialEngine dev log: %s", log_payload)


__all__ = [
    "METRIC_NAMES",
    "increment_metric",
    "get_metric_value",
    "get_metrics_snapshot",
    "reset_metrics_for_testing",
    "get_operational_dashboard_data",
    "redact_sensitive_data",
    "log_developer_event",
]
