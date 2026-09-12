from __future__ import annotations

from app.modules.intelligence.semantic_search.ranking import HybridRankingEngine


def test_exact_match_beats_semantic_only():
    ranking_engine = HybridRankingEngine()

    exact = ranking_engine.score(
        lexical=1.0,
        semantic=0.65,
        quality=0.8,
        popularity=0.4,
        freshness=0.8,
        geo=0.0,
    )

    semantic_only = ranking_engine.score(
        lexical=0.2,
        semantic=0.95,
        quality=0.8,
        popularity=0.4,
        freshness=0.8,
        geo=0.0,
    )

    assert exact > semantic_only


def test_quality_and_popularity_boost():
    ranking_engine = HybridRankingEngine()

    high_quality = ranking_engine.score(
        lexical=0.7,
        semantic=0.7,
        quality=1.0,
        popularity=1.0,
    )

    low_quality = ranking_engine.score(
        lexical=0.7,
        semantic=0.7,
        quality=0.2,
        popularity=0.0,
    )

    assert high_quality > low_quality
