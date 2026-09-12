from __future__ import annotations


class HybridRankingEngine:
    """Calculates multi-signal relevance score blending lexical, semantic, quality, and geo signals."""

    def __init__(
        self,
        lexical_weight: float = 0.55,
        semantic_weight: float = 0.45,
        quality_weight: float = 0.15,
        popularity_weight: float = 0.10,
        freshness_weight: float = 0.05,
        geo_weight: float = 0.05,
    ) -> None:
        self.lexical_weight = lexical_weight
        self.semantic_weight = semantic_weight
        self.quality_weight = quality_weight
        self.popularity_weight = popularity_weight
        self.freshness_weight = freshness_weight
        self.geo_weight = geo_weight

    def score(
        self,
        lexical: float = 0.0,
        semantic: float = 0.0,
        quality: float = 0.8,
        popularity: float = 0.0,
        freshness: float = 0.8,
        geo: float = 0.0,
    ) -> float:
        """
        Computes composite hybrid relevance score.
        Preserves exact match advantage while promoting semantically relevant documents.
        """
        core_hybrid = (
            (lexical * self.lexical_weight) +
            (semantic * self.semantic_weight)
        )

        # Baseline composite
        total_score = (
            (core_hybrid * 0.65) +
            (quality * self.quality_weight) +
            (popularity * self.popularity_weight) +
            (freshness * self.freshness_weight) +
            (geo * self.geo_weight)
        )

        return round(total_score, 4)
