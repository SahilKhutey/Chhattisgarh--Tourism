from __future__ import annotations

import re
import unicodedata
import uuid
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.content_entries.models.content_entry import ContentEntry
from .models import EntityAlias, GraphEntity, GraphRelationship


def normalize_alias_text(text: str) -> str:
    """Normalizes alias text with NFKC unicode normalization and space stripping."""
    norm = unicodedata.normalize("NFKC", text.lower().strip())
    return re.sub(r"\s+", " ", norm)


def slugify(text: str) -> str:
    """Generates standard URL-safe slug from entity name."""
    s = normalize_alias_text(text)
    s = re.sub(r"[^\w\s-]", "", s)
    return re.sub(r"[-\s]+", "-", s).strip("-")


class EntityExtractor:
    """
    Extracts canonical entities and relationships deterministically from structured content fields.
    Never hallucinates ungrounded entities.
    """

    def resolve_or_create_entity(
        self,
        db: Session,
        entity_type: str,
        name: str,
        locale: str = "en",
        metadata: dict[str, Any] | None = None,
    ) -> GraphEntity:
        """Resolves existing entity via alias lookup or creates new canonical entity."""
        normalized = normalize_alias_text(name)
        type_upper = entity_type.upper().strip()

        # 1. Check alias lookup
        alias_stmt = select(EntityAlias).where(
            EntityAlias.locale == locale,
            EntityAlias.normalized_alias == normalized,
            EntityAlias.entity_type == type_upper,
        )
        alias_match = db.scalar(alias_stmt)
        if alias_match:
            entity = db.get(GraphEntity, alias_match.entity_id)
            if entity:
                return entity

        # 2. Check canonical entity by slug and type
        candidate_slug = slugify(name)
        entity_stmt = select(GraphEntity).where(
            GraphEntity.entity_type == type_upper,
            GraphEntity.slug == candidate_slug,
            GraphEntity.locale == locale,
        )
        existing = db.scalar(entity_stmt)
        if existing:
            return existing

        # 3. Create new entity and primary alias
        new_entity = GraphEntity(
            id=uuid.uuid4(),
            entity_type=type_upper,
            canonical_name=name.strip(),
            slug=candidate_slug,
            locale=locale,
            aliases=[name.strip()],
            extra_metadata=metadata or {},
        )
        db.add(new_entity)
        db.flush()

        new_alias = EntityAlias(
            id=uuid.uuid4(),
            entity_id=new_entity.id,
            alias=name.strip(),
            locale=locale,
            normalized_alias=normalized,
            entity_type=type_upper,
        )
        db.add(new_alias)
        db.flush()

        return new_entity

    def add_relationship(
        self,
        db: Session,
        source_id: UUID,
        relationship_type: str,
        target_id: UUID,
        confidence: float = 1.0,
        source: str = "CONTENT_FIELD",
    ) -> GraphRelationship:
        """Adds or updates relationship edge with confidence and source tracking."""
        rel_type = relationship_type.upper().strip()
        stmt = select(GraphRelationship).where(
            GraphRelationship.source_entity_id == source_id,
            GraphRelationship.relationship_type == rel_type,
            GraphRelationship.target_entity_id == target_id,
        )
        existing = db.scalar(stmt)
        if existing:
            existing.confidence = max(existing.confidence, confidence)
            db.flush()
            return existing

        rel = GraphRelationship(
            id=uuid.uuid4(),
            source_entity_id=source_id,
            relationship_type=rel_type,
            target_entity_id=target_id,
            confidence=confidence,
            source=source,
        )
        db.add(rel)
        db.flush()
        return rel

    def extract_from_entry(
        self,
        db: Session,
        entry: ContentEntry,
        locale: str = "en",
    ) -> tuple[GraphEntity, list[GraphRelationship]]:
        """
        Extracts primary entity for the content entry and structured relationship edges.
        Only called for published entries.
        """
        values = entry.values or {}
        title = str(values.get("title") or values.get("name") or entry.slug or "Destination")
        content_type = str(values.get("content_type") or values.get("category") or "DESTINATION").upper()

        # 1. Primary destination / attraction entity
        primary_entity = self.resolve_or_create_entity(
            db,
            entity_type=content_type,
            name=title,
            locale=locale,
            metadata={
                "content_entry_id": str(entry.id),
                "slug": entry.slug,
            },
        )

        created_relations: list[GraphRelationship] = []

        # 2. District entity & LOCATED_IN relationship
        district_name = values.get("district")
        if district_name and isinstance(district_name, str):
            district_entity = self.resolve_or_create_entity(
                db,
                entity_type="DISTRICT",
                name=district_name,
                locale=locale,
            )
            rel = self.add_relationship(
                db,
                source_id=primary_entity.id,
                relationship_type="LOCATED_IN",
                target_id=district_entity.id,
                confidence=1.0,
                source="CONTENT_FIELD",
            )
            created_relations.append(rel)

        # 3. Category entities & HAS_CATEGORY
        categories = values.get("categories") or ([values.get("category")] if values.get("category") else [])
        if isinstance(categories, list):
            for cat in categories:
                if cat and isinstance(cat, str):
                    cat_entity = self.resolve_or_create_entity(
                        db,
                        entity_type="CATEGORY",
                        name=cat,
                        locale=locale,
                    )
                    rel = self.add_relationship(
                        db,
                        source_id=primary_entity.id,
                        relationship_type="HAS_CATEGORY",
                        target_id=cat_entity.id,
                        confidence=1.0,
                        source="CONTENT_FIELD",
                    )
                    created_relations.append(rel)

        # 4. Activities & HAS_ACTIVITY
        activities = values.get("activities") or []
        if isinstance(activities, list):
            for act in activities:
                if act and isinstance(act, str):
                    act_entity = self.resolve_or_create_entity(
                        db,
                        entity_type="ACTIVITY",
                        name=act,
                        locale=locale,
                    )
                    rel = self.add_relationship(
                        db,
                        source_id=primary_entity.id,
                        relationship_type="HAS_ACTIVITY",
                        target_id=act_entity.id,
                        confidence=1.0,
                        source="CONTENT_FIELD",
                    )
                    created_relations.append(rel)

        # 5. Tags & HAS_TAG
        tags = values.get("tags") or []
        if isinstance(tags, list):
            for tag in tags:
                if tag and isinstance(tag, str):
                    tag_entity = self.resolve_or_create_entity(
                        db,
                        entity_type="TAG",
                        name=tag,
                        locale=locale,
                    )
                    rel = self.add_relationship(
                        db,
                        source_id=primary_entity.id,
                        relationship_type="HAS_TAG",
                        target_id=tag_entity.id,
                        confidence=0.9,
                        source="TAXONOMY",
                    )
                    created_relations.append(rel)

        return primary_entity, created_relations
