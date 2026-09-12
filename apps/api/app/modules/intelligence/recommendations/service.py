from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.search.models import SearchDocument
from .candidates import CandidateCollector
from .ranking import RecommendationRankingEngine
from .schemas import CandidateSource, Recommendation, RecommendationCandidate, RecommendationResponse

logger = logging.getLogger(__name__)


class RecommendationService:
    """Service orchestrating multi-source recommendation candidate collection, diversity, and caching."""

    def __init__(
        self,
        candidate_collector: CandidateCollector | None = None,
        ranking_engine: RecommendationRankingEngine | None = None,
    ) -> None:
        self.collector = candidate_collector or CandidateCollector()
        self.ranking_engine = ranking_engine or RecommendationRankingEngine()

    def recommend(
        self,
        db: Session,
        content_entry_id: UUID | str,
        locale: str = "en",
        limit: int = 8,
    ) -> list[Recommendation]:
        """
        Generates contextual recommendations for a published destination or experience.
        Guarantees: Current content is excluded; unverified/unpublished content is never recommended.
        """
        entry_uuid = UUID(str(content_entry_id)) if isinstance(content_entry_id, str) else content_entry_id
        entry = db.get(ContentEntry, entry_uuid)
        if not entry or entry.status != "PUBLISHED":
            return []

        # 1. Collect candidates across sources
        candidates = self.collector.collect(db, entry, locale=locale)

        # 2. Strict exclusion: filter out current content entry
        filtered_candidates = [c for c in candidates if c.content_id != str(entry.id)]

        # 3. Fallback hierarchy: if candidate set is empty, return popular published entries
        if not filtered_candidates:
            popular_docs = db.scalars(
                select(SearchDocument).where(
                    SearchDocument.content_entry_id != entry.id,
                    SearchDocument.locale == locale,
                    SearchDocument.is_published.is_(True),
                ).order_by(SearchDocument.popularity_score.desc()).limit(limit)
            ).all()

            for doc in popular_docs:
                filtered_candidates.append(
                    RecommendationCandidate(
                        content_id=str(doc.content_entry_id),
                        slug=doc.slug,
                        title=doc.title,
                        content_type=doc.content_type,
                        district=doc.district,
                        category=doc.categories[0] if doc.categories else None,
                        source=CandidateSource.POPULAR,
                        raw_score=0.60,
                        reason="Popular in Chhattisgarh",
                    )
                )

        # 4. Rank and diversify
        return self.ranking_engine.rank(filtered_candidates, limit=limit)
