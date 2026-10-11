from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass(slots=True)
class SocialSyncRequested:
    """Event representation for requesting account synchronization."""

    account_id: uuid.UUID
    platform: str
    requested_by: str = "system"
    reason: str = "scheduled"  # scheduled, manual, retry, webhook
    priority: int = 50
    run_id: str = field(default_factory=lambda: uuid.uuid4().hex[:16])
    force: bool = False
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict[str, Any]:
        return {
            "account_id": str(self.account_id),
            "platform": self.platform,
            "requested_by": self.requested_by,
            "reason": self.reason,
            "priority": self.priority,
            "run_id": self.run_id,
            "force": self.force,
            "timestamp": self.timestamp.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> SocialSyncRequested:
        return cls(
            account_id=uuid.UUID(data["account_id"]) if isinstance(data["account_id"], str) else data["account_id"],
            platform=data["platform"],
            requested_by=data.get("requested_by", "system"),
            reason=data.get("reason", "scheduled"),
            priority=data.get("priority", 50),
            run_id=data.get("run_id") or uuid.uuid4().hex[:16],
            force=data.get("force", False),
        )


__all__ = ["SocialSyncRequested"]
