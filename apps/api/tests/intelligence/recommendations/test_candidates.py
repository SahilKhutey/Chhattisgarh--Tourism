from __future__ import annotations

from app.modules.intelligence.embeddings.service import EmbeddingService
from app.modules.intelligence.knowledge_graph.service import KnowledgeGraphService
from app.modules.intelligence.recommendations.candidates import CandidateCollector


def test_collect_candidates_across_sources(db_session, sample_data):
    emb_service = EmbeddingService()
    kg_service = KnowledgeGraphService()

    chitrakote = sample_data["chitrakote"]
    tirathgarh = sample_data["tirathgarh"]
    sirpur = sample_data["sirpur"]

    # Index embeddings and graph
    emb_service.index_entry(db_session, chitrakote, locale="en")
    emb_service.index_entry(db_session, tirathgarh, locale="en")
    emb_service.index_entry(db_session, sirpur, locale="en")

    kg_service.build_for_entry(db_session, chitrakote, locale="en")
    kg_service.build_for_entry(db_session, tirathgarh, locale="en")
    kg_service.build_for_entry(db_session, sirpur, locale="en")

    collector = CandidateCollector()
    candidates = collector.collect(db_session, chitrakote, locale="en")

    assert len(candidates) > 0
    candidate_slugs = {c.slug for c in candidates}
    # Tirathgarh should be found as candidate (same district Bastar, same category Nature, similar semantic text)
    assert "tirathgarh-waterfall" in candidate_slugs
