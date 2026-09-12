from __future__ import annotations

import hashlib
import logging
import uuid
from typing import Any
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.modules.content_entries.models.content_entry import ContentEntry
from .base import EmbeddingProvider
from .local import get_embedding_provider
from .models import ContentEmbedding, EmbeddingModel

logger = logging.getLogger(__name__)


def build_semantic_text(
    *,
    title: str,
    content_type: str,
    district: str | None = None,
    categories: list[str] | None = None,
    tags: list[str] | None = None,
    description: str | None = None,
    body: str | None = None,
    extra_fields: dict[str, Any] | None = None,
) -> str:
    """
    Builds a deterministic, semantic document text representation for embedding.
    Never embeds raw unstructured JSON directly.
    """
    parts: list[str] = [
        title.strip(),
        f"Type: {content_type.strip()}",
    ]

    if district:
        parts.append(f"District: {district.strip()}")

    if categories:
        parts.append(f"Categories: {', '.join(sorted(categories))}")

    if tags:
        parts.append(f"Tags: {', '.join(sorted(tags))}")

    if description and description.strip():
        parts.append(description.strip())

    if body and body.strip():
        parts.append(body.strip())

    if extra_fields:
        for k, v in sorted(extra_fields.items()):
            if v and isinstance(v, (str, int, float)):
                parts.append(f"{k.capitalize()}: {v}")

    return "\n\n".join(parts)


def calculate_source_hash(text: str) -> str:
    """Calculates SHA-256 digest of semantic text to detect content changes."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


class EmbeddingService:
    """Service managing embedding generation, model versioning, and persistence."""

    def __init__(self, provider: EmbeddingProvider | None = None) -> None:
        self.provider = provider or get_embedding_provider()

    def get_or_create_active_model(self, db: Session) -> EmbeddingModel:
        """Retrieves or registers the active embedding model."""
        stmt = select(EmbeddingModel).where(EmbeddingModel.is_active.is_(True)).order_by(EmbeddingModel.created_at.desc())
        model = db.scalar(stmt)
        if model is None:
            model = EmbeddingModel(
                id=uuid.uuid4(),
                model_name=getattr(self.provider, "model_name", "BAAI/bge-m3"),
                model_version="1.0",
                dimension=self.provider.dimension,
                provider="local",
                is_active=True,
            )
            db.add(model)
            db.flush()
        return model

    def index_entry(
        self,
        db: Session,
        entry: ContentEntry,
        locale: str = "en",
        dry_run: bool = False,
    ) -> ContentEmbedding | None:
        """
        Extracts semantic text, checks source hash cache, embeds, and stores vector.
        Strict boundary: Only entries with status == 'PUBLISHED' can be embedded.
        """
        if entry.status != "PUBLISHED":
            logger.debug("Skipping embedding for non-published entry %s (%s)", entry.id, entry.status)
            return None

        values = entry.values or {}
        title = str(values.get("title") or values.get("name") or entry.slug or "Untitled")
        content_type = str(values.get("content_type") or values.get("category") or "destination")
        district = values.get("district")
        categories = values.get("categories") or ([values.get("category")] if values.get("category") else [])
        tags = values.get("tags") or []
        description = values.get("description") or values.get("summary") or ""
        body = values.get("body") or values.get("content") or ""

        semantic_text = build_semantic_text(
            title=title,
            content_type=content_type,
            district=district,
            categories=categories if isinstance(categories, list) else [str(categories)],
            tags=tags if isinstance(tags, list) else [str(tags)],
            description=str(description) if description else None,
            body=str(body) if body else None,
        )

        source_hash = calculate_source_hash(semantic_text)
        active_model = self.get_or_create_active_model(db)

        # 1. Check existing embedding and source hash
        stmt = select(ContentEmbedding).where(
            ContentEmbedding.content_entry_id == entry.id,
            ContentEmbedding.model_id == active_model.id,
            ContentEmbedding.locale == locale,
        )
        existing = db.scalar(stmt)

        if existing and existing.source_hash == source_hash:
            # Content unchanged, skip inference
            return existing

        # 2. Generate vector
        vectors = self.provider.embed([semantic_text])
        if not vectors:
            return None
        vector = vectors[0]

        if dry_run:
            return None

        if existing:
            existing.embedding = vector
            existing.source_hash = source_hash
            existing.content_version = str(getattr(entry, "version", "1.0") or "1.0")
            db.flush()
            return existing
        else:
            embedding_record = ContentEmbedding(
                id=uuid.uuid4(),
                content_entry_id=entry.id,
                model_id=active_model.id,
                locale=locale,
                embedding=vector,
                source_hash=source_hash,
                content_version=str(getattr(entry, "version", "1.0") or "1.0"),
            )
            db.add(embedding_record)
            db.flush()
            return embedding_record

    def remove_entry(self, db: Session, entry_id: UUID | str) -> int:
        """Purges all embeddings for an entry upon unpublishing or archiving."""
        entry_uuid = UUID(str(entry_id))
        stmt = delete(ContentEmbedding).where(ContentEmbedding.content_entry_id == entry_uuid)
        result = db.execute(stmt)
        db.flush()
        return result.rowcount or 0
