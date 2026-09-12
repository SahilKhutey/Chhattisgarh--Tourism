from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import delete, func, or_, select
from sqlalchemy.orm import Session

from .models import EntityAlias, GraphEntity, GraphRelationship


class KnowledgeGraphRepository:
    """Repository handling persistence and queries for knowledge graph entities and relationships."""

    def get_entity_by_slug(self, db: Session, slug: str, locale: str = "en") -> GraphEntity | None:
        stmt = select(GraphEntity).where(
            GraphEntity.slug == slug,
            GraphEntity.locale == locale,
        )
        return db.scalar(stmt)

    def get_entity_by_id(self, db: Session, entity_id: UUID) -> GraphEntity | None:
        return db.get(GraphEntity, entity_id)

    def get_entity_by_content_id(self, db: Session, content_id: str | UUID) -> GraphEntity | None:
        content_str = str(content_id)
        # Search by extra_metadata["content_entry_id"]
        stmt = select(GraphEntity)
        entities = db.scalars(stmt).all()
        for e in entities:
            if (e.extra_metadata or {}).get("content_entry_id") == content_str:
                return e
        return None

    def get_outgoing_relationships(
        self,
        db: Session,
        source_id: UUID,
        rel_type: str | None = None,
    ) -> list[tuple[GraphRelationship, GraphEntity]]:
        stmt = select(GraphRelationship, GraphEntity).join(
            GraphEntity,
            GraphRelationship.target_entity_id == GraphEntity.id,
        ).where(GraphRelationship.source_entity_id == source_id)
        if rel_type:
            stmt = stmt.where(GraphRelationship.relationship_type == rel_type.upper())
        return list(db.execute(stmt).all())

    def get_incoming_relationships(
        self,
        db: Session,
        target_id: UUID,
        rel_type: str | None = None,
    ) -> list[tuple[GraphRelationship, GraphEntity]]:
        stmt = select(GraphRelationship, GraphEntity).join(
            GraphEntity,
            GraphRelationship.source_entity_id == GraphEntity.id,
        ).where(GraphRelationship.target_entity_id == target_id)
        if rel_type:
            stmt = stmt.where(GraphRelationship.relationship_type == rel_type.upper())
        return list(db.execute(stmt).all())

    def remove_entity_relationships(self, db: Session, entity_id: UUID) -> int:
        stmt = delete(GraphRelationship).where(
            or_(
                GraphRelationship.source_entity_id == entity_id,
                GraphRelationship.target_entity_id == entity_id,
            )
        )
        res = db.execute(stmt)
        db.flush()
        return res.rowcount or 0

    def count_entities(self, db: Session) -> int:
        return db.scalar(select(func.count(GraphEntity.id))) or 0

    def count_relationships(self, db: Session) -> int:
        return db.scalar(select(func.count(GraphRelationship.id))) or 0
