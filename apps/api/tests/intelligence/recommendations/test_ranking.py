from __future__ import annotations

from app.modules.intelligence.recommendations.ranking import RecommendationRankingEngine
from app.modules.intelligence.recommendations.schemas import CandidateSource, RecommendationCandidate


def test_recommendation_evidence_merging():
    engine = RecommendationRankingEngine()
    candidates = [
        RecommendationCandidate(
            content_id="item-1",
            slug="tirathgarh-waterfall",
            title="Tirathgarh Waterfall",
            content_type="WATERFALL",
            district="Bastar",
            source=CandidateSource.SEMANTIC,
            raw_score=0.9,
            reason="Similar experience",
        ),
        RecommendationCandidate(
            content_id="item-1",
            slug="tirathgarh-waterfall",
            title="Tirathgarh Waterfall",
            content_type="WATERFALL",
            district="Bastar",
            source=CandidateSource.DISTRICT,
            raw_score=0.8,
            reason="Also in Bastar",
        ),
    ]

    results = engine.rank(candidates, limit=5)
    assert len(results) == 1
    # Evidence bonus applied
    assert results[0].score > 0.8
    assert "Bastar" in results[0].reason


def test_recommendations_are_diverse():
    engine = RecommendationRankingEngine()
    candidates = [
        RecommendationCandidate(
            content_id=f"wf-{i}",
            slug=f"waterfall-{i}",
            title=f"Waterfall {i}",
            content_type="WATERFALL",
            source=CandidateSource.SEMANTIC,
            raw_score=0.9 - (i * 0.01),
            reason="Waterfall",
        )
        for i in range(5)
    ] + [
        RecommendationCandidate(
            content_id="heritage-1",
            slug="temple-1",
            title="Temple 1",
            content_type="TEMPLE",
            source=CandidateSource.GRAPH,
            raw_score=0.7,
            reason="Heritage site",
        )
    ]

    ranked = engine.rank(candidates, limit=5)
    types = {r.content_type for r in ranked}
    # Both WATERFALL and TEMPLE should be represented (diversity enforced)
    assert len(types) >= 2
