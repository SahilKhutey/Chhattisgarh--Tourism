from __future__ import annotations

from app.modules.social.events.definitions import (
    SocialWorkflowEvent,
    SocialWorkflowEventType,
)
from app.modules.social.events.handlers import (
    INVALIDATED_CACHE_KEYS,
    WORKFLOW_METRICS,
    cache_invalidation_handler,
    metrics_handler,
    register_default_handlers,
)
from app.modules.social.events.publisher import SocialEventPublisher

# Automatically register default handlers on import
register_default_handlers()

__all__ = [
    "SocialWorkflowEvent",
    "SocialWorkflowEventType",
    "SocialEventPublisher",
    "WORKFLOW_METRICS",
    "INVALIDATED_CACHE_KEYS",
    "cache_invalidation_handler",
    "metrics_handler",
    "register_default_handlers",
]
