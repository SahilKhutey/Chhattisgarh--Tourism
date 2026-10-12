from __future__ import annotations

import logging
from collections import defaultdict
from typing import Any

from app.modules.social.events.definitions import SocialWorkflowEvent, SocialWorkflowEventType

logger = logging.getLogger(__name__)

# In-memory metrics tracking for workflow observability (Section 9.65)
WORKFLOW_METRICS: dict[str, int] = defaultdict(int)

# In-memory cache invalidation tracker
INVALIDATED_CACHE_KEYS: list[str] = []


def cache_invalidation_handler(event: SocialWorkflowEvent) -> None:
    """Invalidates feed and entity caches on content lifecycle mutations (Section 10.33)."""
    invalidate_types = {
        SocialWorkflowEventType.CONTENT_PUBLISHED,
        SocialWorkflowEventType.CONTENT_HIDDEN,
        SocialWorkflowEventType.CONTENT_RESTORED,
        SocialWorkflowEventType.CONTENT_SOURCE_DELETED,
        SocialWorkflowEventType.ACCOUNT_PAUSED,
        SocialWorkflowEventType.ACCOUNT_DISCONNECTED,
    }

    if event.event_type in invalidate_types:
        keys = ["social:feed:all", "social:feed:global"]

        district = event.metadata.get("district_id")
        if district:
            keys.append(f"social:feed:district:{district.lower()}")

        place_id = event.metadata.get("place_id")
        place_slug = event.metadata.get("place_slug")
        if place_id:
            keys.append(f"social:feed:place:{place_id}")
        if place_slug:
            keys.append(f"social:feed:place:{place_slug.lower()}")

        if "content_id" in event.metadata:
            keys.append(f"social:content:{event.metadata['content_id']}")
        elif event.aggregate_type == "SocialContent":
            keys.append(f"social:content:{event.aggregate_id}")

        if "creator_id" in event.metadata:
            keys.append(f"social:creator:{event.metadata['creator_id']}")
        elif event.aggregate_type == "Creator":
            keys.append(f"social:creator:{event.aggregate_id}")

        INVALIDATED_CACHE_KEYS.extend(keys)

        # Best-effort Redis invalidation
        try:
            from app.core.redis import redis_client
            redis_client.delete(*keys)
        except Exception:
            pass

        logger.debug("Cache invalidated keys: %s for event %s", keys, event.event_type)


def metrics_handler(event: SocialWorkflowEvent) -> None:
    """Increments workflow telemetry counters."""
    WORKFLOW_METRICS[f"{event.event_type}_total"] += 1


def audit_log_handler(event: SocialWorkflowEvent) -> None:
    """Logs workflow event for operational tracking."""
    logger.info(
        "SocialWorkflow [%s] on %s(%s) by actor %s",
        event.event_type,
        event.aggregate_type,
        event.aggregate_id,
        event.actor_id,
    )


def register_default_handlers() -> None:
    """Registers the standard workflow event handlers."""
    from app.modules.social.events.publisher import SocialEventPublisher

    SocialEventPublisher.subscribe(cache_invalidation_handler)
    SocialEventPublisher.subscribe(metrics_handler)
    SocialEventPublisher.subscribe(audit_log_handler)


__all__ = [
    "WORKFLOW_METRICS",
    "INVALIDATED_CACHE_KEYS",
    "cache_invalidation_handler",
    "metrics_handler",
    "audit_log_handler",
    "register_default_handlers",
]
