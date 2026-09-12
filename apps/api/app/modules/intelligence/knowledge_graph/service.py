from __future__ import annotations

import logging
from uuid import UUID

from sqlalchemy.orm import Session

from app.modules.content_entries.models.content_entry import ContentEntry
from .extraction import EntityExtractor
from .graph import BoundedGraphTraverser
from .models import GraphEntity, GraphRelationship
from .repository import KnowledgeGraphRepository
from .schemas import PublicContextEntity, PublicContextResponse

logger = logging.getLogger(__name__)


class KnowledgeGraphService:
    """Service managing graph lifecycle, entity resolution, and public contextual lookup."""

    def __init__(
        self,
        repository: KnowledgeGraphRepository | None = None,
        extractor: EntityExtractor | None = None,
        traverser: BoundedGraphTraverser | None = None,
    ) -> None:
        self.repository = repository or KnowledgeGraphRepository()
        self.extractor = extractor or EntityExtractor()
        self.traverser = traverser or BoundedGraphTraverser()

    def build_for_entry(
        self,
        db: Session,
        entry: ContentEntry,
        locale: str = "en",
    ) -> tuple[GraphEntity, list[GraphRelationship]] | None:
        """
        Builds knowledge graph nodes and edges for published content entry.
        Strict boundary: Only published content is linked.
        """
        if entry.status != "PUBLISHED":
            logger.debug("Skipping graph build for unpublished entry %s", entry.id)
            return None

        # Clean existing relations if any
        existing_entity = self.repository.get_entity_by_content_id(db, entry.id)
        if existing_entity:
            self.repository.remove_entity_relationships(db, existing_entity.id)

        return self.extractor.extract_from_entry(db, entry, locale=locale)

    def remove_for_entry(self, db: Session, entry_id: UUID | str) -> int:
        """Removes graph relationships and references for unpublished/archived entry."""
        entity = self.repository.get_entity_by_content_id(db, entry_id)
        if not entity:
            return 0
        return self.repository.remove_entity_relationships(db, entity.id)

    def get_content_context(
        self,
        db: Session,
        slug: str,
        locale: str = "en",
    ) -> PublicContextResponse | None:
        """
        Returns safe public contextual knowledge for a destination/experience:
        located_in, categories, activities, nearby attractions without exposing internal IDs.
        """
        entity = self.repository.get_entity_by_slug(db, slug, locale=locale)
        if not entity:
            # Fallback search by metadata slug
            for e in db.query(GraphEntity).filter(GraphEntity.locale == locale).all():
                if (e.extra_metadata or {}).get("slug") == slug:
                    entity = e
                    break

        if not entity:
            return None

        located_in: PublicContextEntity | None = None
        categories: list[str] = []
        activities: list[str] = []
        near_attractions: list[PublicContextEntity] = []

        outgoing = self.repository.get_outgoing_relationships(db, entity.id)
        for rel, target in outgoing:
            if rel.relationship_type == "LOCATED_IN":
                located_in = PublicContextEntity(
                    name=target.canonical_name,
                    type=target.entity_type,
                    slug=target.slug,
                )
            elif rel.relationship_type == "HAS_CATEGORY":
                categories.append(target.canonical_name)
            elif rel.relationship_type == "HAS_ACTIVITY":
                activities.append(target.canonical_name)
            elif rel.relationship_type == "NEAR":
                near_attractions.append(
                    PublicContextEntity(
                        name=target.canonical_name,
                        type=target.entity_type,
                        slug=target.slug,
                    )
                )

        # Also find siblings in same district
        if located_in:
            district_entity = self.repository.get_entity_by_slug(db, located_in.slug or "", locale=locale)
            if district_entity:
                siblings = self.repository.get_incoming_relationships(
                    db,
                    district_entity.id,
                    rel_type="LOCATED_IN",
                )
                for _, sib in siblings:
                    if sib.id != entity.id and len(near_attractions) < 4:
                        near_attractions.append(
                            PublicContextEntity(
                                name=sib.canonical_name,
                                type=sib.entity_type,
                                slug=sib.slug,
                            )
                        )

        return PublicContextResponse(
            entity=PublicContextEntity(
                name=entity.canonical_name,
                type=entity.entity_type,
                slug=entity.slug,
            ),
            located_in=located_in,
            categories=sorted(list(set(categories))),
            activities=sorted(list(set(activities))),
            near_attractions=near_attractions,
        )
