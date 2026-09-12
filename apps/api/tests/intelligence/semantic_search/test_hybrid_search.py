from __future__ import annotations

from unittest.mock import patch
from app.modules.intelligence.embeddings.service import EmbeddingService
from app.modules.intelligence.semantic_search.service import SemanticSearchService


def test_hybrid_search_mode_lexical(db_session, sample_data):
    service = SemanticSearchService()
    resp = service.search(
        db=db_session,
        query="Chitrakote",
        locale="en",
        mode="lexical",
    )
    assert resp.mode == "lexical"
    assert resp.semantic_enabled is False
    assert len(resp.items) > 0
    assert resp.items[0].slug == "chitrakote-waterfall"


def test_hybrid_search_fallback_on_vector_failure(db_session, sample_data):
    service = SemanticSearchService()

    # Simulate vector failure in semantic repository
    with patch.object(
        service.semantic_repository,
        "find_nearest_candidates",
        side_effect=RuntimeError("Simulated pgvector timeout"),
    ):
        resp = service.search(
            db=db_session,
            query="Chitrakote",
            locale="en",
            mode="hybrid",
        )

        assert resp.fallback_used is True
        assert resp.semantic_enabled is False
        assert len(resp.items) > 0
        assert resp.items[0].slug == "chitrakote-waterfall"


def test_exact_name_query_preservation(db_session, sample_data):
    emb_service = EmbeddingService()
    emb_service.index_entry(db_session, sample_data["chitrakote"], locale="en")
    emb_service.index_entry(db_session, sample_data["tirathgarh"], locale="en")
    emb_service.index_entry(db_session, sample_data["sirpur"], locale="en")

    service = SemanticSearchService()
    resp = service.search(
        db=db_session,
        query="Sirpur",
        locale="en",
        mode="hybrid",
    )

    assert len(resp.items) > 0
    assert resp.items[0].slug == "sirpur-heritage-site"
