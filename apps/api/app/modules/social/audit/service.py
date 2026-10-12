from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.events.publisher import create_outbox_event
from app.modules.social.events.definitions import _make_json_safe


class SocialAuditService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def record(
        self,
        action: str,
        entity_type: str | None = None,
        entity_id: uuid.UUID | str | None = None,
        actor_id: uuid.UUID | str | None = None,
        details: dict[str, Any] | None = None,
        target_type: str | None = None,
        target_id: uuid.UUID | str | None = None,
        actor: uuid.UUID | str | None = None,
    ) -> None:
        etype = entity_type or target_type or "Unknown"
        eid = entity_id or target_id or uuid.uuid4()
        aid = actor_id or actor
        payload = {
            "action": action,
            "entity_type": str(etype),
            "entity_id": str(eid),
            "actor_id": str(aid) if aid else None,
            "details": _make_json_safe(details or {}),
        }
        create_outbox_event(
            self.session,
            event_type=f"SOCIAL_AUDIT_{action.upper()}",
            aggregate_id=uuid.UUID(str(eid)) if isinstance(eid, uuid.UUID) else uuid.uuid4(),
            payload=payload,
        )
        self.session.flush()


__all__ = ["SocialAuditService"]
