from __future__ import annotations

import difflib
import uuid
from typing import Any

from app.modules.social.creators.repository import CreatorRepository


class CreatorDuplicateService:
    """Detects potential duplicate creator profiles using name similarity and district matching."""

    def __init__(self, repository: CreatorRepository | None = None) -> None:
        self.repository = repository

    def calculate_confidence(
        self,
        name1: str,
        name2: str,
        district1: str | None = None,
        district2: str | None = None,
    ) -> float:
        n1 = name1.strip().lower()
        n2 = name2.strip().lower()

        if n1 == n2:
            base_score = 1.0
        else:
            matcher = difflib.SequenceMatcher(None, n1, n2)
            base_score = matcher.ratio()

            # Token overlap bonus
            t1 = set(n1.split())
            t2 = set(n2.split())
            if t1 and t2:
                overlap = len(t1.intersection(t2)) / max(len(t1), len(t2))
                base_score = max(base_score, overlap * 0.9)

        if district1 and district2 and str(district1).lower() == str(district2).lower():
            base_score = min(1.0, base_score + 0.05)

        return round(base_score, 2)

    def _calculate_confidence(
        self,
        name1: str,
        name2: str,
        district1: str | None,
        district2: str | None,
    ) -> float:
        return self.calculate_confidence(name1, name2, district1, district2)

    def find_candidates_sync(
        self,
        *,
        display_name: str,
        district_id: Any = None,
        min_confidence: float = 0.6,
        existing_creators: list[Any] | None = None,
    ) -> dict[str, list[dict[str, Any]]]:
        if existing_creators is not None:
            candidates = existing_creators
        elif self.repository:
            candidates = self.repository.list_creators(limit=100)
        else:
            candidates = []

        possible_duplicates: list[dict[str, Any]] = []

        for candidate in candidates:
            confidence = self.calculate_confidence(
                display_name,
                candidate.display_name,
                district_id,
                candidate.district_id,
            )
            if confidence >= min_confidence:
                possible_duplicates.append(
                    {
                        "creator_id": str(candidate.id),
                        "display_name": candidate.display_name,
                        "handle": candidate.handle,
                        "confidence": confidence,
                    }
                )

        possible_duplicates.sort(key=lambda x: x["confidence"], reverse=True)
        return {"possible_duplicates": possible_duplicates}

    async def find_candidates(
        self,
        *,
        display_name: str,
        district_id: Any = None,
        min_confidence: float = 0.6,
    ) -> dict[str, list[dict[str, Any]]]:
        return self.find_candidates_sync(
            display_name=display_name,
            district_id=district_id,
            min_confidence=min_confidence,
        )


__all__ = ["CreatorDuplicateService"]
