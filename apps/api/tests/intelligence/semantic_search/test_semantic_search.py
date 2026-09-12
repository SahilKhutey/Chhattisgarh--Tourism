from __future__ import annotations

from app.modules.intelligence.embeddings.service import EmbeddingService
from app.modules.intelligence.semantic_search.repository import SemanticSearchRepository
from app.modules.intelligence.semantic_search.service import SemanticSearchService


def test_semantic_search_finds_related_content(db_session, sample_data):
    emb_service = EmbeddingService()
    # Index published destinations
    emb_service.index_entry(db_session, sample_data["chitrakote"], locale="en")
    emb_service.index_entry(db_session, sample_data["tirathgarh"], locale="en")
    emb_service.index_entry(db_session, sample_data["sirpur"], locale="en")

    service = SemanticSearchService()
    response = service.search(
        db=db_session,
        query="peaceful waterfalls in nature",
        locale="en",
        mode="hybrid",
    )

    assert response.total > 0
    assert any(item.content_type in {"WATERFALL", "NATURE"} for item in response.items)
    # Highest ranked item should be Chitrakote or Tirathgarh waterfall
    assert response.items[0].content_type == "WATERFALL"


def test_draft_content_excluded_from_semantic_results(db_session, sample_data):
    emb_service = EmbeddingService()
    # Try indexing draft (should be skipped)
    emb_service.index_entry(db_session, sample_data["draft"], locale="en")

    service = SemanticSearchService()
    response = service.search(
        db=db_session,
        query="Secret Unreleased Cave adventure",
        locale="en",
        mode="hybrid",
    )

    # Draft entry must never appear in search results
    assert all(item.id != str(sample_data["draft"].id) for item in response.items)
