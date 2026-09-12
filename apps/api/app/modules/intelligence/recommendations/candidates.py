from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.search.models import SearchDocument
from ..embeddings.models import ContentEmbedding
from ..embeddings.service import EmbeddingService
from ..knowledge_graph.repository import KnowledgeGraphRepository
from ..semantic_search.repository import SemanticSearchRepository
from .schemas import CandidateSource, RecommendationCandidate

logger = logging.getLogger(__name__)


class CandidateCollector:
    """Collects recommendation candidates across semantic, graph, category, district, and geo sources."""

    def __init__(
        self,
        semantic_repository: SemanticSearchRepository | None = None,
        kg_repository: KnowledgeGraphRepository | None = None,
        embedding_service: EmbeddingService | None = None,
    ) -> None:
        self.semantic_repository = semantic_repository or SemanticSearchRepository()
        self.kg_repository = kg_repository or KnowledgeGraphRepository()
        self.embedding_service = embedding_service or EmbeddingService()

    def collect(
        self,
        db: Session,
        current_entry: ContentEntry,
        locale: str = "en",
    ) -> list[RecommendationCandidate]:
        candidates: list[RecommendationCandidate] = []
        current_id_str = str(current_entry.id)
        values = current_entry.values or {}
        current_title = str(values.get("title") or values.get("name") or current_entry.slug)
        current_district = values.get("district")
        current_category = values.get("category") or (values.get("categories", [None])[0] if values.get("categories") else None)

        # 1. Semantic candidates
        try:
            active_model = self.embedding_service.get_or_create_active_model(db)
            current_embedding = db.scalar(
                select(ContentEmbedding).where(
                    ContentEmbedding.content_entry_id == current_entry.id,
                    ContentEmbedding.model_id == active_model.id,
                    ContentEmbedding.locale == locale,
                )
            )
            if current_embedding and current_embedding.embedding:
                sem_matches = self.semantic_repository.find_nearest_candidates(
                    db=db,
                    query_vector=list(current_embedding.embedding),
                    model_id=active_model.id,
                    locale=locale,
                    limit=20,
                    similarity_threshold=0.6,
                )
                for sm in sem_matches:
                    if sm.content_entry_id == current_id_str:
                        continue
                    doc = db.scalar(
                        select(SearchDocument).where(
                            SearchDocument.content_entry_id == UUID(sm.content_entry_id),
                            SearchDocument.locale == locale,
                            SearchDocument.is_published.is_(True),
                        )
                    )
                    if doc:
                        candidates.append(
                            RecommendationCandidate(
                                content_id=sm.content_entry_id,
                                slug=doc.slug,
                                title=doc.title,
                                content_type=doc.content_type,
                                district=doc.district,
                                category=doc.categories[0] if doc.categories else None,
                                source=CandidateSource.SEMANTIC,
                                raw_score=sm.similarity,
                                reason=f"Similar experience to {current_title}",
                            )
                        )
        except Exception as e:
            logger.debug("Semantic candidate gathering skipped: %s", e)

        # 2. Graph candidates (neighbors and district siblings)
        try:
            entity = self.kg_repository.get_entity_by_content_id(db, current_entry.id)
            if entity:
                # Find direct outgoing relationships (e.g. LOCATED_IN district)
                outgoing = self.kg_repository.get_outgoing_relationships(db, entity.id)
                for rel, target in outgoing:
                    if rel.relationship_type == "LOCATED_IN":
                        # Find siblings in district
                        siblings = self.kg_repository.get_incoming_relationships(
                            db,
                            target.id,
                            rel_type="LOCATED_IN",
                        )
                        for sib_rel, sib_entity in siblings:
                            sib_content_id = (sib_entity.extra_metadata or {}).get("content_entry_id")
                            if sib_content_id and sib_content_id != current_id_str:
                                doc = db.scalar(
                                    select(SearchDocument).where(
                                        SearchDocument.content_entry_id == UUID(sib_content_id),
                                        SearchDocument.locale == locale,
                                        SearchDocument.is_published.is_(True),
                                    )
                                )
                                if doc:
                                    candidates.append(
                                        RecommendationCandidate(
                                            content_id=sib_content_id,
                                            slug=doc.slug,
                                            title=doc.title,
                                            content_type=doc.content_type,
                                            district=doc.district,
                                            category=doc.categories[0] if doc.categories else None,
                                            source=CandidateSource.GRAPH,
                                            raw_score=0.85,
                                            reason=f"Connected in {target.canonical_name}",
                                        )
                                    )
        except Exception as e:
            logger.debug("Graph candidate gathering skipped: %s", e)

        # 3. Category candidates
        if current_category:
            cat_docs = db.scalars(
                select(SearchDocument).where(
                    SearchDocument.content_entry_id != current_entry.id,
                    SearchDocument.locale == locale,
                    SearchDocument.is_published.is_(True),
                ).limit(10)
            ).all()
            for cd in cat_docs:
                if current_category in (cd.categories or []):
                    candidates.append(
                        RecommendationCandidate(
                            content_id=str(cd.content_entry_id),
                            slug=cd.slug,
                            title=cd.title,
                            content_type=cd.content_type,
                            district=cd.district,
                            category=cd.categories[0] if cd.categories else None,
                            source=CandidateSource.CATEGORY,
                            raw_score=0.75,
                            reason=f"Popular in {current_category}",
                        )
                    )

        # 4. District candidates
        if current_district:
            dist_docs = db.scalars(
                select(SearchDocument).where(
                    SearchDocument.content_entry_id != current_entry.id,
                    SearchDocument.district == current_district,
                    SearchDocument.locale == locale,
                    SearchDocument.is_published.is_(True),
                ).limit(10)
            ).all()
            for dd in dist_docs:
                candidates.append(
                    RecommendationCandidate(
                        content_id=str(dd.content_entry_id),
                        slug=dd.slug,
                        title=dd.title,
                        content_type=dd.content_type,
                        district=dd.district,
                        category=dd.categories[0] if dd.categories else None,
                        source=CandidateSource.DISTRICT,
                        raw_score=0.70,
                        reason=f"Also located in {current_district}",
                    )
                )

        return candidates
