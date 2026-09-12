from __future__ import annotations

from app.modules.intelligence.embeddings.service import EmbeddingService
from app.modules.intelligence.knowledge_graph.service import KnowledgeGraphService
from app.modules.intelligence.recommendations.service import RecommendationService


def test_recommendations_exclude_current_content(db_session, sample_data):
    chitrakote = sample_data["chitrakote"]
    tirathgarh = sample_data["tirathgarh"]
    sirpur = sample_data["sirpur"]

    emb_service = EmbeddingService()
    emb_service.index_entry(db_session, chitrakote, locale="en")
    emb_service.index_entry(db_session, tirathgarh, locale="en")
    emb_service.index_entry(db_session, sirpur, locale="en")

    kg_service = KnowledgeGraphService()
    kg_service.build_for_entry(db_session, chitrakote, locale="en")
    kg_service.build_for_entry(db_session, tirathgarh, locale="en")
    kg_service.build_for_entry(db_session, sirpur, locale="en")

    service = RecommendationService()
    recs = service.recommend(db_session, chitrakote.id, locale="en", limit=5)

    assert len(recs) > 0
    # Current content entry must never appear in its own recommendations
    assert all(r.id != str(chitrakote.id) for r in recs)
    assert all(r.slug != chitrakote.slug for r in recs)


def test_unpublished_content_not_recommended(db_session, sample_data):
    chitrakote = sample_data["chitrakote"]
    draft = sample_data["draft"]

    service = RecommendationService()
    recs = service.recommend(db_session, chitrakote.id, locale="en", limit=5)

    assert all(r.id != str(draft.id) for r in recs)
    assert all(r.slug != draft.slug for r in recs)
