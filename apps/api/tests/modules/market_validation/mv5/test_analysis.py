from fastapi.testclient import TestClient


def test_content_overview(client: TestClient, researcher_headers: dict):
    # Create sample entry
    client.post(
        "/api/v1/market-validation/content/entries",
        json={
            "content_id": "CONT_ANALYSIS_01",
            "content_type": "DESTINATION",
            "title": "Barsoor Historic Temples",
            "category": "HERITAGE",
            "short_description": "City of temples and ponds dating to the Chhindaka Naga dynasty.",
            "governance_status": "CONTENT_VERIFIED",
        },
        headers=researcher_headers,
    )

    resp = client.get("/api/v1/market-validation/content/analysis/overview", headers=researcher_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_content_entries" in data
    assert "verified_entries" in data
    assert "discovery_surfaces" in data
    assert "planning_conversion" in data
    assert data["discovery_surfaces"]["Search -> Destination"] == 0.32


def test_quality_vs_performance(client: TestClient, researcher_headers: dict):
    resp = client.get("/api/v1/market-validation/content/analysis/quality-vs-performance", headers=researcher_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["save_rate_lift"] == 200.0
    assert data["planning_rate_lift"] == 300.0
    assert "strongly predicts" in data["conclusion"]


def test_content_performance_tracking(client: TestClient, researcher_headers: dict):
    content_id = "CONT_PERF_TEST_99"
    # Fire impression, open, and save
    client.post(
        "/api/v1/market-validation/content/discovery/events",
        json={
            "anonymous_user_id": "user-perf-1",
            "session_id": "sess-perf-1",
            "event_type": "content_impression",
            "discovery_source": "MAP",
            "content_entry_id": content_id,
        },
    )
    client.post(
        "/api/v1/market-validation/content/discovery/events",
        json={
            "anonymous_user_id": "user-perf-1",
            "session_id": "sess-perf-1",
            "event_type": "content_opened",
            "discovery_source": "MAP",
            "content_entry_id": content_id,
        },
    )
    client.post(
        "/api/v1/market-validation/content/discovery/events",
        json={
            "anonymous_user_id": "user-perf-1",
            "session_id": "sess-perf-1",
            "event_type": "destination_saved",
            "discovery_source": "MAP",
            "content_entry_id": content_id,
        },
    )

    # Query performance
    resp = client.get("/api/v1/market-validation/content/analysis/performance", headers=researcher_headers)
    assert resp.status_code == 200
    items = resp.json()
    matched = next((p for p in items if p["content_entry_id"] == content_id), None)
    assert matched is not None
    assert matched["impressions"] == 1
    assert matched["opens"] == 1
    assert matched["saves"] == 1
