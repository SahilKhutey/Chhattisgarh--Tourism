from __future__ import annotations

import pytest
from app.modules.search.indexer import SearchIndexer


def test_search_returns_published_content(client, db_session, published_entry):
    indexer = SearchIndexer()
    indexer.index_entry(db_session, published_entry)

    response = client.get(
        "/api/search",
        params={"q": "Chitrakote"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any(item["slug"] == published_entry.slug for item in data["results"])
    assert data["results"][0]["district"] == "Bastar"


def test_draft_is_not_searchable(client, db_session, draft_entry):
    indexer = SearchIndexer()
    indexer.index_entry(db_session, draft_entry)

    response = client.get(
        "/api/search",
        params={"q": draft_entry.slug},
    )
    assert response.status_code == 200
    data = response.json()
    matching_ids = [r["id"] for r in data["results"]]
    assert str(draft_entry.id) not in matching_ids


def test_zero_results(client, db_session, published_entry):
    indexer = SearchIndexer()
    indexer.index_entry(db_session, published_entry)

    response = client.get(
        "/api/search",
        params={"q": "xyz-nonexistent-place-12345"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["results"] == []


def test_search_pagination(client, db_session, published_entry):
    indexer = SearchIndexer()
    indexer.index_entry(db_session, published_entry)

    response = client.get(
        "/api/search",
        params={"q": "waterfall", "page": 1, "page_size": 10},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["page_size"] == 10


def test_suggestions_api(client, db_session, published_entry):
    indexer = SearchIndexer()
    indexer.index_entry(db_session, published_entry)

    response = client.get(
        "/api/search/suggestions",
        params={"q": "Chitr", "locale": "en"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "suggestions" in data
    assert any("Chitrakote" in item["text"] for item in data["suggestions"])


def test_empty_query_returns_discovery_content(client, db_session, published_entry):
    indexer = SearchIndexer()
    indexer.index_entry(db_session, published_entry)

    response = client.get(
        "/api/search",
        params={"q": ""},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["results"]) >= 1


def test_discovery_endpoint(client, db_session, published_entry):
    indexer = SearchIndexer()
    indexer.index_entry(db_session, published_entry)

    response = client.get(
        "/api/search/discovery",
        params={"locale": "en"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "featured_destinations" in data
    assert "popular_categories" in data
    assert "popular_districts" in data


def test_facets_computation(client, db_session, published_entry):
    indexer = SearchIndexer()
    indexer.index_entry(db_session, published_entry)

    response = client.get(
        "/api/search",
        params={"q": "Chitrakote"},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["districts"], list)
    assert isinstance(data["content_types"], list)
    assert isinstance(data["categories"], list)
    districts = [f["value"] for f in data["districts"]]
    assert "Bastar" in districts
