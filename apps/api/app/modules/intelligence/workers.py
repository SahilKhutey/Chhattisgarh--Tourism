from __future__ import annotations

import logging
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.content_entries.models.content_entry import ContentEntry
from .cache import IntelligenceCache
from .embeddings.service import EmbeddingService
from .knowledge_graph.service import KnowledgeGraphService

logger = logging.getLogger(__name__)


def on_content_published(db: Session, entry: ContentEntry, locale: str = "en") -> None:
    """
    Lifecycle handler invoked when an entry is successfully published.
    Generates embedding vector and extracts knowledge graph nodes.
    Strict boundary: Only runs if entry.status == 'PUBLISHED'.
    """
    if entry.status != "PUBLISHED":
        return

    try:
        embedding_service = EmbeddingService()
        embedding_service.index_entry(db, entry, locale=locale)
    except Exception as e:
        logger.error("Failed to generate embedding for entry %s: %s", entry.id, e)

    try:
        kg_service = KnowledgeGraphService()
        kg_service.build_for_entry(db, entry, locale=locale)
    except Exception as e:
        logger.error("Failed to build knowledge graph for entry %s: %s", entry.id, e)

    try:
        IntelligenceCache().invalidate_for_content(str(entry.id))
    except Exception:
        pass


def on_content_archived(db: Session, entry_id: UUID | str) -> None:
    """
    Lifecycle handler invoked when an entry is unpublished or archived.
    Strict boundary: Immediately purges embeddings and graph connections.
    """
    try:
        embedding_service = EmbeddingService()
        embedding_service.remove_entry(db, entry_id)
    except Exception as e:
        logger.error("Failed to purge embedding for entry %s: %s", entry_id, e)

    try:
        kg_service = KnowledgeGraphService()
        kg_service.remove_for_entry(db, entry_id)
    except Exception as e:
        logger.error("Failed to purge knowledge graph for entry %s: %s", entry_id, e)

    try:
        IntelligenceCache().invalidate_for_content(str(entry_id))
    except Exception:
        pass
