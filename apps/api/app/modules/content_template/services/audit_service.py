from __future__ import annotations

import logging
from typing import Any
from sqlalchemy.orm import Session

logger = logging.getLogger("cg_tourism.audit")


class TemplateAuditService:

    def record(
        self,
        db: Session,
        *,
        event_type: str,
        actor_id: Any,
        entity_type: str,
        entity_id: Any,
        payload: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        event_record = {
            "event_type": event_type,
            "actor_id": str(actor_id) if actor_id else None,
            "entity_type": entity_type,
            "entity_id": str(entity_id) if entity_id else None,
            "payload": payload or {},
        }

        logger.info(
            "audit_event: %s on %s:%s by %s",
            event_type,
            entity_type,
            entity_id,
            actor_id,
            extra=event_record,
        )

        return event_record
