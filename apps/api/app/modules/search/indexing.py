from __future__ import annotations

import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.search.indexer import SearchIndexer


def index_content(db: Session, entry_id: uuid.UUID | str) -> None:
    """
    Indexes a published content entry into SearchDocument.
    """
    eid = uuid.UUID(str(entry_id)) if isinstance(entry_id, str) else entry_id
    entry = db.scalar(select(ContentEntry).where(ContentEntry.id == eid))
    if entry and entry.status == "PUBLISHED":
        indexer = SearchIndexer()
        indexer.index_entry(db, entry)
