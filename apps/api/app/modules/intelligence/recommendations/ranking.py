from __future__ import annotations

from collections import defaultdict
from .schemas import CandidateSource, Recommendation, RecommendationCandidate


class RecommendationRankingEngine:
    """Merges candidate evidence, enforces diversity constraints, and generates explainable reasons."""

    MAX_SAME_TYPE = 3

    SOURCE_WEIGHTS = {
        CandidateSource.SEMANTIC: 0.40,
        CandidateSource.GRAPH: 0.25,
        CandidateSource.CATEGORY: 0.15,
        CandidateSource.DISTRICT: 0.10,
        CandidateSource.GEO: 0.10,
        CandidateSource.POPULAR: 0.05,
    }

    def rank(
        self,
        candidates: list[RecommendationCandidate],
        limit: int = 8,
    ) -> list[Recommendation]:
        if not candidates:
            return []

        # 1. Merge evidence by content_id
        grouped: dict[str, list[RecommendationCandidate]] = defaultdict(list)
        for c in candidates:
            grouped[c.content_id].append(c)

        merged: list[tuple[Recommendation, float]] = []

        for cid, items in grouped.items():
            primary = items[0]
            # Calculate combined evidence score
            weighted_score = 0.0
            total_weight = 0.0
            sources_seen = set()

            for item in items:
                w = self.SOURCE_WEIGHTS.get(item.source, 0.10)
                weighted_score += item.raw_score * w
                total_weight += w
                sources_seen.add(item.source)

            base_score = weighted_score / (total_weight or 1.0)
            # Bonus for cross-source reinforcement
            bonus = 0.05 * (len(sources_seen) - 1)
            final_score = round(min(1.0, base_score + bonus), 4)

            # Generate explainable user reason
            reason = primary.reason
            if CandidateSource.SEMANTIC in sources_seen and primary.district:
                reason = f"Similar experience in {primary.district}"
            elif CandidateSource.GRAPH in sources_seen and primary.district:
                reason = f"Also connected in {primary.district}"
            elif CandidateSource.DISTRICT in sources_seen and primary.district:
                reason = f"Also in {primary.district}"
            elif CandidateSource.CATEGORY in sources_seen and primary.category:
                reason = f"Popular in {primary.category}"

            rec = Recommendation(
                id=cid,
                slug=primary.slug,
                title=primary.title,
                content_type=primary.content_type,
                district=primary.district,
                category=primary.category,
                reason=reason,
                score=final_score,
            )
            merged.append((rec, final_score))

        # 2. Sort descending by composite score
        merged.sort(key=lambda x: x[1], reverse=True)

        # 3. Enforce diversity (maximum 3 of identical content_type)
        type_counts: dict[str, int] = defaultdict(int)
        diverse_results: list[Recommendation] = []
        deferred_results: list[Recommendation] = []

        for rec, _ in merged:
            c_type = (rec.content_type or "DESTINATION").upper()
            if type_counts[c_type] < self.MAX_SAME_TYPE:
                type_counts[c_type] += 1
                diverse_results.append(rec)
            else:
                deferred_results.append(rec)

            if len(diverse_results) >= limit:
                break

        # Fill remaining slots with deferred results if available
        if len(diverse_results) < limit:
            for rec in deferred_results:
                diverse_results.append(rec)
                if len(diverse_results) >= limit:
                    break

        return diverse_results[:limit]
