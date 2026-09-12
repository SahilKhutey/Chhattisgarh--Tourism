from __future__ import annotations

import math
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.content_entries.models.content_entry import ContentEntry
from ..embeddings.models import ContentEmbedding
from .schemas import SemanticCandidate


class SemanticSearchRepository:
    """Repository executing vector similarity queries using pgvector or SQLite test fallback."""

    def find_nearest_candidates(
        self,
        db: Session,
        query_vector: list[float],
        model_id: UUID,
        locale: str = "en",
        limit: int = 50,
        similarity_threshold: float = 0.5,
    ) -> list[SemanticCandidate]:
        """
        Retrieves top nearest neighbor published content embeddings.
        Strict boundary: Joins ContentEntry to guarantee entry status is PUBLISHED.
        """
        is_postgres = getattr(db.bind, "dialect", None) and db.bind.dialect.name == "postgresql"

        if is_postgres:
            distance_expr = ContentEmbedding.embedding.cosine_distance(query_vector)
            stmt = (
                select(
                    ContentEmbedding.content_entry_id,
                    distance_expr.label("distance"),
                )
                .join(
                    ContentEntry,
                    ContentEmbedding.content_entry_id == ContentEntry.id,
                )
                .where(
                    ContentEmbedding.model_id == model_id,
                    ContentEmbedding.locale == locale,
                    ContentEntry.status == "PUBLISHED",
                )
                .order_by(distance_expr)
                .limit(limit)
            )
            rows = db.execute(stmt).all()
            results: list[SemanticCandidate] = []
            for entry_id, dist in rows:
                dist_val = float(dist)
                sim = max(0.0, min(1.0, 1.0 - dist_val))
                if sim >= similarity_threshold:
                    results.append(
                        SemanticCandidate(
                            content_entry_id=str(entry_id),
                            distance=dist_val,
                            similarity=sim,
                        )
                    )
            return results

        # SQLite fallback for offline unit testing
        stmt = (
            select(
                ContentEmbedding.content_entry_id,
                ContentEmbedding.embedding,
            )
            .join(
                ContentEntry,
                ContentEmbedding.content_entry_id == ContentEntry.id,
            )
            .where(
                ContentEmbedding.model_id == model_id,
                ContentEmbedding.locale == locale,
                ContentEntry.status == "PUBLISHED",
            )
        )
        rows = db.execute(stmt).all()
        scored: list[tuple[str, float, float]] = []

        q_norm = math.sqrt(sum(x * x for x in query_vector)) or 1.0

        for entry_id, vec in rows:
            if not vec:
                continue
            # Vec can be list or string in SQLite
            if isinstance(vec, str):
                vec_nums = [float(x) for x in vec.strip("[]").split(",") if x.strip()]
            else:
                vec_nums = list(vec)

            v_norm = math.sqrt(sum(x * x for x in vec_nums)) or 1.0
            dot_product = sum(a * b for a, b in zip(query_vector, vec_nums))
            cos_sim = dot_product / (q_norm * v_norm)
            sim = max(0.0, min(1.0, (cos_sim + 1.0) / 2.0 if cos_sim < 0 else cos_sim))
            dist = max(0.0, 1.0 - sim)

            if sim >= similarity_threshold:
                scored.append((str(entry_id), dist, sim))

        scored.sort(key=lambda x: x[1])  # sort by distance ascending
        return [
            SemanticCandidate(
                content_entry_id=eid,
                distance=d,
                similarity=s,
            )
            for eid, d, s in scored[:limit]
        ]
