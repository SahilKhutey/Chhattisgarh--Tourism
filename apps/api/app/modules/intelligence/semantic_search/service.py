from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.search.models import SearchDocument
from app.modules.search.repository import SearchRepository
from app.modules.search.schemas import SearchResult
from ..embeddings.service import EmbeddingService
from ..query.intent import IntentClassifier
from .ranking import HybridRankingEngine
from .repository import SemanticSearchRepository
from .schemas import HybridSearchItem, HybridSearchResponse

logger = logging.getLogger(__name__)


class SemanticSearchService:
    """Orchestrates hybrid retrieval blending P11 lexical FTS/trigram with P12 vector similarity."""

    def __init__(
        self,
        search_repository: SearchRepository | None = None,
        semantic_repository: SemanticSearchRepository | None = None,
        embedding_service: EmbeddingService | None = None,
        ranking_engine: HybridRankingEngine | None = None,
        intent_classifier: IntentClassifier | None = None,
    ) -> None:
        self.search_repository = search_repository or SearchRepository()
        self.semantic_repository = semantic_repository or SemanticSearchRepository()
        self.embedding_service = embedding_service or EmbeddingService()
        self.ranking_engine = ranking_engine or HybridRankingEngine()
        self.intent_classifier = intent_classifier or IntentClassifier()

    def search(
        self,
        db: Session,
        query: str,
        locale: str = "en",
        content_type: str | None = None,
        district: str | None = None,
        category: str | None = None,
        tag: str | None = None,
        latitude: float | None = None,
        longitude: float | None = None,
        radius_km: float | None = None,
        page: int = 1,
        page_size: int = 20,
        mode: str = "hybrid",
    ) -> HybridSearchResponse:
        """
        Executes hybrid or lexical search with automatic graceful fallback to lexical on vector failure.
        """
        cleaned_query = query.strip()
        detected_intent = self.intent_classifier.classify(cleaned_query)

        # Mode lexical: pass directly through to P11 search
        if mode == "lexical" or not cleaned_query:
            docs, total = self.search_repository.search_documents(
                db=db,
                query_text=cleaned_query,
                locale=locale,
                content_type=content_type,
                district=district,
                category=category,
                tag=tag,
                latitude=latitude,
                longitude=longitude,
                radius_km=radius_km,
                offset=(page - 1) * page_size,
                limit=page_size,
            )
            items = [
                HybridSearchItem(
                    id=str(d.content_entry_id),
                    slug=d.slug,
                    title=d.title,
                    content_type=d.content_type,
                    district=d.district,
                    categories=d.categories or [],
                    tags=d.tags or [],
                    description=d.description,
                    thumbnail_url=getattr(d, "thumbnail_url", None),
                    latitude=d.latitude,
                    longitude=d.longitude,
                    score=1.0,
                    lexical_score=1.0,
                    semantic_score=None,
                    hybrid_score=1.0,
                    match_reason="Lexical match",
                )
                for d in docs
            ]
            return HybridSearchResponse(
                query=cleaned_query,
                mode="lexical",
                total=total,
                page=page,
                page_size=page_size,
                items=items,
                semantic_enabled=False,
                fallback_used=False,
                intent=detected_intent.value if detected_intent else None,
            )

        # Mode hybrid: retrieve lexical + semantic candidates
        fallback_used = False
        semantic_candidates_map: dict[str, float] = {}

        try:
            active_model = self.embedding_service.get_or_create_active_model(db)
            query_vectors = self.embedding_service.provider.embed([cleaned_query])
            if query_vectors:
                sem_candidates = self.semantic_repository.find_nearest_candidates(
                    db=db,
                    query_vector=query_vectors[0],
                    model_id=active_model.id,
                    locale=locale,
                    limit=50,
                    similarity_threshold=0.05,
                )
                for sc in sem_candidates:
                    semantic_candidates_map[sc.content_entry_id] = sc.similarity
        except Exception as e:
            logger.warning("Semantic candidate retrieval failed; falling back to lexical: %s", e)
            fallback_used = True

        # P11 Lexical retrieval
        lexical_docs, _ = self.search_repository.search_documents(
            db=db,
            query_text=cleaned_query,
            locale=locale,
            content_type=content_type,
            district=district,
            category=category,
            tag=tag,
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            offset=0,
            limit=50,
        )

        lexical_candidates_map: dict[str, tuple[SearchDocument, float]] = {}
        for rank, d in enumerate(lexical_docs):
            # Normalizing rank to 0..1 lexical score
            lex_score = max(0.2, 1.0 - (rank * 0.05))
            lexical_candidates_map[str(d.content_entry_id)] = (d, lex_score)

        # Merge candidate document IDs
        all_candidate_ids = set(lexical_candidates_map.keys()) | set(semantic_candidates_map.keys())
        if not all_candidate_ids:
            return HybridSearchResponse(
                query=cleaned_query,
                mode="hybrid",
                total=0,
                page=page,
                page_size=page_size,
                items=[],
                semantic_enabled=not fallback_used,
                fallback_used=fallback_used,
                intent=detected_intent.value if detected_intent else None,
            )

        # Load SearchDocument records for semantic-only matches
        needed_docs = all_candidate_ids - set(lexical_candidates_map.keys())
        if needed_docs:
            stmt = select(SearchDocument).where(
                SearchDocument.content_entry_id.in_([UUID(x) for x in needed_docs]),
                SearchDocument.locale == locale,
                SearchDocument.is_published.is_(True),
            )
            for d in db.scalars(stmt).all():
                lexical_candidates_map[str(d.content_entry_id)] = (d, 0.0)

        # Score and rank merged candidates
        scored_items: list[tuple[SearchDocument, float, float, float, str]] = []
        for cid, (doc, lex_score) in lexical_candidates_map.items():
            sem_score = semantic_candidates_map.get(cid, 0.0)
            final_score = self.ranking_engine.score(
                lexical=lex_score,
                semantic=sem_score,
                quality=doc.quality_score or 0.8,
                popularity=float(doc.popularity_score or 0.0),
                freshness=0.8,
                geo=0.0,
            )

            reason = "Hybrid match"
            if lex_score > 0.8 and sem_score > 0.7:
                reason = "Exact keyword & semantic match"
            elif lex_score > 0.8:
                reason = "Exact keyword match"
            elif sem_score > 0.7:
                reason = f"Understood concept ({detected_intent.value if detected_intent else 'nature'})"

            scored_items.append((doc, final_score, lex_score, sem_score, reason))

        # Sort descending by final score
        scored_items.sort(key=lambda x: x[1], reverse=True)

        total = len(scored_items)
        offset = (page - 1) * page_size
        page_slice = scored_items[offset : offset + page_size]

        formatted_items = [
            HybridSearchItem(
                id=str(doc.content_entry_id),
                slug=doc.slug,
                title=doc.title,
                content_type=doc.content_type,
                district=doc.district,
                categories=doc.categories or [],
                tags=doc.tags or [],
                description=doc.description,
                thumbnail_url=getattr(doc, "thumbnail_url", None),
                latitude=doc.latitude,
                longitude=doc.longitude,
                score=score,
                lexical_score=lex,
                semantic_score=sem if sem > 0 else None,
                hybrid_score=score,
                match_reason=reason,
            )
            for doc, score, lex, sem, reason in page_slice
        ]

        return HybridSearchResponse(
            query=cleaned_query,
            mode="hybrid",
            total=total,
            page=page,
            page_size=page_size,
            items=formatted_items,
            semantic_enabled=not fallback_used,
            fallback_used=fallback_used,
            intent=detected_intent.value if detected_intent else None,
        )
