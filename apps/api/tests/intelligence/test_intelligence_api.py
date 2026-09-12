from __future__ import annotations

from app.modules.intelligence.embeddings.service import EmbeddingService
from app.modules.intelligence.knowledge_graph.service import KnowledgeGraphService


def test_api_discover_endpoint(client, db_session, sample_data):
    response = client.get("/api/discover?q=peaceful%20waterfalls&locale=en")
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "peaceful waterfalls"
    assert data["intent"] == "nature"
    assert "results" in data
    assert "suggested_queries" in data
    assert "related_categories" in data


def test_api_content_recommendations(client, db_session, sample_data):
    chitrakote = sample_data["chitrakote"]
    tirathgarh = sample_data["tirathgarh"]

    emb_service = EmbeddingService()
    kg_service = KnowledgeGraphService()

    emb_service.index_entry(db_session, chitrakote, locale="en")
    emb_service.index_entry(db_session, tirathgarh, locale="en")
    kg_service.build_for_entry(db_session, chitrakote, locale="en")
    kg_service.build_for_entry(db_session, tirathgarh, locale="en")

    response = client.get("/api/content/chitrakote-waterfall/recommendations?locale=en")
    assert response.status_code == 200
    data = response.json()
    assert data["source_content_id"] == str(chitrakote.id)
    assert len(data["recommendations"]) > 0
    # Must exclude itself
    assert all(r["id"] != str(chitrakote.id) for r in data["recommendations"])


def test_api_content_context(client, db_session, sample_data):
    chitrakote = sample_data["chitrakote"]
    kg_service = KnowledgeGraphService()
    kg_service.build_for_entry(db_session, chitrakote, locale="en")

    response = client.get("/api/content/chitrakote-waterfall/context?locale=en")
    assert response.status_code == 200
    data = response.json()
    assert data["entity"]["name"] == "Chitrakote Waterfall"
    assert data["located_in"]["name"] == "Bastar"


def test_api_admin_intelligence_health(client, db_session, sample_data):
    response = client.get("/api/admin/intelligence/health")
    assert response.status_code == 200
    data = response.json()
    assert "intelligence" in data
    assert "embedding_model" in data["intelligence"]
    assert "graph_entities" in data["intelligence"]


def test_api_admin_rebuild(client, db_session, sample_data):
    response = client.post("/api/admin/intelligence/rebuild?target=all")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["published_entries_processed"] >= 3
