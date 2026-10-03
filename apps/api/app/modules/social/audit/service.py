from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.events.publisher import create_outbox_event


class SocialAuditService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def record(
        self,
        action: str,
        entity_type: str,
        entity_id: uuid.UUID | str,
        actor_id: uuid.UUID | str | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        payload = {
            "action": action,
            "entity_type": entity_type,
            "entity_id": str(entity_id),
            "actor_id": str(actor_id) if actor_id else None,
            "details": details or {},
        }
        create_outbox_event(
            self.session,
            event_type=f"SOCIAL_AUDIT_{action.upper()}",
            aggregate_id=uuid.UUID(str(entity_id)) if isinstance(entity_id, uuid.UUID) else uuid.uuid4(),
            payload=payload,
        )
        self.session.flush()


__all__ = ["SocialAuditService"]
