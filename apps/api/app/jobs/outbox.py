from __future__ import annotations

import logging
import time
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.events.models import OutboxEvent
from app.events.publisher import dispatch_domain_event

logger = logging.getLogger(__name__)


def process_outbox_once(db: Session | None = None, limit: int = 100) -> int:
    """
    Processes pending outbox events in chronological order.
    Returns the count of successfully processed events.
    """
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    processed_count = 0
    try:
        bind = db.get_bind()
        if bind is not None and bind.dialect.name == "sqlite":
            OutboxEvent.__table__.create(bind=bind, checkfirst=True)

        stmt = (
            select(OutboxEvent)
            .where(OutboxEvent.processed.is_(False))
            .order_by(OutboxEvent.created_at.asc())
            .limit(limit)
        )
        events = list(db.scalars(stmt).all())

        for event in events:
            try:
                dispatch_domain_event(event, db)
                event.processed = True
                event.processed_at = datetime.now(timezone.utc)
                event.last_error = None
                processed_count += 1
            except Exception as exc:
                logger.exception("Failed processing outbox event %s: %s", event.id, exc)
                event.last_error = str(exc)

        db.commit()
    except Exception as exc:
        db.rollback()
        logger.error("Outbox processing cycle failed: %s", exc)
    finally:
        if should_close:
            db.close()

    return processed_count


def worker(poll_interval_seconds: float = 1.0) -> None:
    """Continuous polling worker loop for outbox events."""
    logger.info("Starting outbox background processor...")
    while True:
        try:
            processed = process_outbox_once()
            if processed > 0:
                logger.debug("Processed %d outbox events", processed)
        except Exception as exc:
            logger.error("Unexpected outbox worker error: %s", exc)
        time.sleep(poll_interval_seconds)


if __name__ == "__main__":
    worker()
