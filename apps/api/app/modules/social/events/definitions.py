from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
from typing import Any


class SocialWorkflowEventType(StrEnum):
    # Creator Lifecycle
    CREATOR_CREATED = "social.creator.created"
    CREATOR_UPDATED = "social.creator.updated"
    CREATOR_ACTIVATED = "social.creator.activated"
    CREATOR_PAUSED = "social.creator.paused"
    CREATOR_ARCHIVED = "social.creator.archived"

    # Social Account Lifecycle
    ACCOUNT_REGISTERED = "social.account.registered"
    ACCOUNT_VERIFICATION_STARTED = "social.account.verification_started"
    ACCOUNT_VERIFIED = "social.account.verified"
    ACCOUNT_VERIFICATION_FAILED = "social.account.verification_failed"
    ACCOUNT_ACCEPTED = "social.account.accepted"
    ACCOUNT_REJECTED = "social.account.rejected"
    ACCOUNT_ACTIVATED = "social.account.activated"
    ACCOUNT_PAUSED = "social.account.paused"
    ACCOUNT_REACTIVATED = "social.account.reactivated"
    ACCOUNT_DISCONNECTED = "social.account.disconnected"

    # Synchronization
    SYNC_QUEUED = "social.sync.queued"
    SYNC_STARTED = "social.sync.started"
    SYNC_COMPLETED = "social.sync.completed"
    SYNC_FAILED = "social.sync.failed"
    SYNC_BLOCKED = "social.sync.blocked"

    # Content Lifecycle
    CONTENT_DISCOVERED = "social.content.discovered"
    CONTENT_VALIDATED = "social.content.validated"
    CONTENT_UNDER_REVIEW = "social.content.under_review"
    CONTENT_APPROVED = "social.content.approved"
    CONTENT_REJECTED = "social.content.rejected"
    CONTENT_PUBLISHED = "social.content.published"
    CONTENT_HIDDEN = "social.content.hidden"
    CONTENT_RESTORED = "social.content.restored"
    CONTENT_SOURCE_UNAVAILABLE = "social.content.source_unavailable"
    CONTENT_SOURCE_DELETED = "social.content.source_deleted"

    # Tourism Context
    TOURISM_CONTEXT_ASSIGNED = "social.tourism.context_assigned"


def _make_json_safe(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {str(k): _make_json_safe(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple, set)):
        return [_make_json_safe(item) for item in obj]
    elif isinstance(obj, uuid.UUID):
        return str(obj)
    elif hasattr(obj, "value"):
        return obj.value
    elif isinstance(obj, datetime):
        return obj.isoformat()
    return obj


@dataclass(frozen=True)
class SocialWorkflowEvent:
    """Canonical internal workflow event model for Social Engine Phase 9."""

    event_type: str
    aggregate_type: str
    aggregate_id: str
    actor_id: str | None = None
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: dict[str, Any] = field(default_factory=dict)
    event_id: str = field(default_factory=lambda: uuid.uuid4().hex)

    def to_dict(self) -> dict[str, Any]:
        evt_type = self.event_type.value if hasattr(self.event_type, "value") else str(self.event_type)
        return {
            "event_id": str(self.event_id),
            "event_type": evt_type,
            "aggregate_type": str(self.aggregate_type),
            "aggregate_id": str(self.aggregate_id),
            "actor_id": str(self.actor_id) if self.actor_id is not None else None,
            "timestamp": self.timestamp.isoformat() if hasattr(self.timestamp, "isoformat") else str(self.timestamp),
            "metadata": _make_json_safe(self.metadata),
        }


__all__ = [
    "SocialWorkflowEventType",
    "SocialWorkflowEvent",
    "_make_json_safe",
]
