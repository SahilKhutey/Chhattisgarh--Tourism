from __future__ import annotations

import uuid
from sqlalchemy.orm import Session

from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_entries.services.entry_service import ContentEntryService


def publish_entry(
    db: Session,
    entry_id: uuid.UUID | str,
    actor_id: str,
) -> ContentEntry:
    """
    Executes a controlled, transactional publication workflow.
    Guarantees bound immutable template version validation, gate enforcement,
    accessibility check, search indexing, vector embedding, and durable OutboxEvent generation.
    """
    service = ContentEntryService()
    return service.publish(
        db=db,
        entry_id=entry_id,
        user_id=actor_id,
    )
