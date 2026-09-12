from __future__ import annotations

import json
import logging
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.redis import redis_client
from app.events.models import OutboxEvent
from app.events.types import EventType

logger = logging.getLogger(__name__)


@dataclass
class DomainEvent:
    event_type: str
    aggregate_id: str
    timestamp: str
    payload: dict


def create_outbox_event(
    db: Session,
    event_type: EventType | str,
    aggregate_id: UUID,
    payload: dict,
) -> OutboxEvent:
    """
    Transactionally records an outbox event in the same DB transaction as the mutation.
    """
    bind = db.get_bind()
    if bind is not None and bind.dialect.name == "sqlite":
        OutboxEvent.__table__.create(bind=bind, checkfirst=True)

    event = OutboxEvent(
        event_type=str(event_type),
        aggregate_id=aggregate_id,
        payload=payload,
        created_at=datetime.now(timezone.utc),
        processed=False,
    )
    db.add(event)
    db.flush()
    return event


def dispatch_domain_event(event: OutboxEvent, db: Session) -> None:
    """
    Dispatches an event to cache, search indexer, vector embeddings, and redis subscribers.
    """
    # 1. Publish to Redis channel (best-effort notification)
    try:
        domain_evt = DomainEvent(
            event_type=event.event_type,
            aggregate_id=str(event.aggregate_id),
            timestamp=event.created_at.isoformat(),
            payload=event.payload,
        )
        redis_client.publish(
            "cg-tourism.events",
            json.dumps(asdict(domain_evt)),
        )
    except Exception as exc:
        logger.debug("Redis event publish notification skipped: %s", exc)

    # 2. Synchronize dependent subsystems based on event type
    if event.event_type == EventType.CONTENT_PUBLISHED:
        slug = event.payload.get("slug")
        entry_id = event.aggregate_id

        # Invalidate public content cache
        if slug:
            try:
                from app.modules.public_content.cache import PublicContentCache
                PublicContentCache().invalidate(slug)
            except Exception as exc:
                logger.warning("Cache invalidation failed: %s", exc)

        # Index in search & intelligence
        from app.modules.content_entries.models.content_entry import ContentEntry
        entry = db.scalar(select(ContentEntry).where(ContentEntry.id == entry_id))
        if entry:
            try:
                from app.modules.search.indexer import SearchIndexer
                SearchIndexer().index_entry(db, entry)
            except Exception as exc:
                logger.warning("Search indexing failed: %s", exc)

            try:
                from app.modules.intelligence.workers import on_content_published
                on_content_published(db, entry)
            except Exception as exc:
                logger.warning("Intelligence embedding failed: %s", exc)

    elif event.event_type in (EventType.CONTENT_UNPUBLISHED, EventType.CONTENT_ARCHIVED):
        slug = event.payload.get("slug")
        entry_id = event.aggregate_id

        if slug:
            try:
                from app.modules.public_content.cache import PublicContentCache
                PublicContentCache().invalidate(slug)
            except Exception as exc:
                logger.warning("Cache invalidation failed: %s", exc)

        try:
            from app.modules.search.indexer import SearchIndexer
            SearchIndexer().remove_entry(db, entry_id)
        except Exception as exc:
            logger.warning("Search index purge failed: %s", exc)

        try:
            from app.modules.intelligence.workers import on_content_archived
            on_content_archived(db, entry_id)
        except Exception as exc:
            logger.warning("Intelligence purge failed: %s", exc)
