from __future__ import annotations

import logging
import uuid
from typing import Callable
from sqlalchemy.orm import Session

from app.events.models import OutboxEvent
from app.modules.social.events.definitions import SocialWorkflowEvent

logger = logging.getLogger(__name__)


class SocialEventPublisher:
    """
    Transactional event publisher for Social Engine workflows.
    Inserts into outbox_events within the active SQLAlchemy transaction.
    """

    _subscribers: list[Callable[[SocialWorkflowEvent], None]] = []

    def __init__(self, session: Session | None = None) -> None:
        self.session = session

    @classmethod
    def subscribe(cls, handler: Callable[[SocialWorkflowEvent], None]) -> None:
        if handler not in cls._subscribers:
            cls._subscribers.append(handler)

    @classmethod
    def unsubscribe(cls, handler: Callable[[SocialWorkflowEvent], None]) -> None:
        if handler in cls._subscribers:
            cls._subscribers.remove(handler)

    def publish(self, event: SocialWorkflowEvent) -> None:
        """
        Record event to Outbox table within the current DB session,
        and dispatch to registered in-memory handlers.
        """
        # 1. Outbox table transactional insertion
        if self.session is not None:
            try:
                # Convert aggregate_id to UUID if valid, or generate deterministic UUID
                try:
                    agg_uuid = uuid.UUID(event.aggregate_id)
                except (ValueError, TypeError):
                    agg_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, event.aggregate_id)

                evt_type = str(event.event_type.value if hasattr(event.event_type, "value") else event.event_type)
                outbox_entry = OutboxEvent(
                    id=uuid.UUID(event.event_id) if len(event.event_id) == 36 else uuid.uuid4(),
                    event_type=evt_type,
                    aggregate_id=agg_uuid,
                    payload=event.to_dict(),
                    processed=False,
                )
                self.session.add(outbox_entry)
            except Exception as exc:
                logger.error("Failed to append outbox event %s: %s", event.event_type, exc)
                # Let session propagate exception to preserve transactional integrity

        # 2. Dispatch to in-memory subscribers (metrics, cache invalidation, logger)
        for handler in self._subscribers:
            try:
                handler(event)
            except Exception as exc:
                logger.warning("Social event handler failed for %s: %s", event.event_type, exc)


__all__ = ["SocialEventPublisher"]
