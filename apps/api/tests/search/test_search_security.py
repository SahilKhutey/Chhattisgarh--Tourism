from __future__ import annotations

import pytest
from app.modules.search.indexer import SearchIndexer


def test_sql_injection_is_safe(client, db_session, published_entry, draft_entry):
    indexer = SearchIndexer()
    indexer.index_entry(db_session, published_entry)
    indexer.index_entry(db_session, draft_entry)

    # Malicious SQL injection payloads
    payloads = [
        "' OR 1=1 --",
        "'; DROP TABLE search_documents; --",
        "UNION SELECT * FROM content_entries --",
    ]

    for payload in payloads:
        response = client.get(
            "/api/search",
            params={"q": payload},
        )
        assert response.status_code == 200
        data = response.json()
        ids = [item["id"] for item in data["results"]]
        # Assert draft entry was NOT leaked through SQL injection
        assert str(draft_entry.id) not in ids


def test_xss_query_is_safe(client, db_session, published_entry):
    indexer = SearchIndexer()
    indexer.index_entry(db_session, published_entry)

    response = client.get(
        "/api/search",
        params={"q": "<script>alert('xss')</script>"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "<script>alert('xss')</script>"


def test_invalid_parameters_rejected(client):
    # page_size > 50
    resp1 = client.get("/api/search", params={"page_size": 100})
    assert resp1.status_code == 422

    # negative page
    resp2 = client.get("/api/search", params={"page": 0})
    assert resp2.status_code == 422

    # radius_km > 500
    resp3 = client.get("/api/search", params={"radius_km": 1000})
    assert resp3.status_code == 422

    # invalid locale
    resp4 = client.get("/api/search", params={"locale": "fr"})
    assert resp4.status_code == 422
