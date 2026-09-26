from fastapi.testclient import TestClient


def setup_discovery_content(client: TestClient, headers: dict):
    client.post(
        "/api/v1/market-validation/content/entries",
        json={
            "content_id": "CONT_JAGDALPUR_DISC",
            "content_type": "DESTINATION",
            "title": "Jagdalpur Heritage City",
            "category": "HERITAGE",
            "destination_id": "DEST_JAGDALPUR",
            "short_description": "Urban base with historic royal palace and temples.",
        },
        headers=headers,
    )
    client.post(
        "/api/v1/market-validation/content/entries",
        json={
            "content_id": "CONT_CHITRAKOTE_DISC",
            "content_type": "DESTINATION",
            "title": "Chitrakote Waterfalls",
            "category": "WATERFALL",
            "destination_id": "DEST_CHITRAKOTE",
            "short_description": "Spectacular waterfall on Indravati river.",
        },
        headers=headers,
    )


def test_discovery_source(client: TestClient, researcher_headers: dict):
    payload = {
        "anonymous_user_id": "user-anon-100",
        "session_id": "sess-xyz-001",
        "event_type": "content_opened",
        "discovery_source": "MAP",
        "content_entry_id": "CONT_CHITRAKOTE_DISC",
        "destination_id": "DEST_CHITRAKOTE",
    }
    resp = client.post("/api/v1/market-validation/content/discovery/events", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["discovery_source"] == "MAP"
    assert data["anonymous_user_id"] == "user-anon-100"


def test_discovery_attribution(client: TestClient, researcher_headers: dict):
    # Event via NEARBY recommendation
    payload = {
        "anonymous_user_id": "user-anon-200",
        "session_id": "sess-xyz-002",
        "event_type": "destination_discovered",
        "discovery_source": "NEARBY",
        "content_entry_id": "CONT_TIRATHGARH",
        "destination_id": "DEST_TIRATHGARH",
        "metadata_json": {"anchor_destination": "DEST_JAGDALPUR", "radius_km": 25},
    }
    resp = client.post("/api/v1/market-validation/content/discovery/events", json=payload)
    assert resp.status_code == 201
    assert resp.json()["metadata_json"]["anchor_destination"] == "DEST_JAGDALPUR"


def test_destination_discovery(client: TestClient, researcher_headers: dict):
    payload = {
        "anonymous_user_id": "user-anon-300",
        "session_id": "sess-xyz-003",
        "event_type": "destination_saved",
        "discovery_source": "SEARCH",
        "destination_id": "DEST_CHITRAKOTE",
    }
    resp = client.post("/api/v1/market-validation/content/discovery/events", json=payload)
    assert resp.status_code == 201
    assert resp.json()["event_type"] == "destination_saved"


def test_content_to_planning(client: TestClient, researcher_headers: dict):
    content_id = "CONT_PLAN_TEST_01"
    # First create impression and open
    client.post(
        "/api/v1/market-validation/content/discovery/events",
        json={
            "anonymous_user_id": "user-anon-400",
            "session_id": "sess-plan-001",
            "event_type": "content_opened",
            "discovery_source": "DIRECT",
            "content_entry_id": content_id,
        },
    )
    # Then start itinerary
    resp = client.post(
        "/api/v1/market-validation/content/discovery/events",
        json={
            "anonymous_user_id": "user-anon-400",
            "session_id": "sess-plan-001",
            "event_type": "itinerary_started",
            "discovery_source": "DIRECT",
            "content_entry_id": content_id,
        },
    )
    assert resp.status_code == 201

    # Check funnel
    funnel_resp = client.get("/api/v1/market-validation/content/discovery/funnel", headers=researcher_headers)
    assert funnel_resp.status_code == 200
    assert len(funnel_resp.json()["funnel_steps"]) == 7


def test_content_search(client: TestClient, researcher_headers: dict):
    setup_discovery_content(client, researcher_headers)
    search_payload = {
        "query": "waterfall",
        "intent_category": "WATERFALL",
        "limit": 10,
    }
    resp = client.post("/api/v1/market-validation/content/discovery/search", json=search_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert any("Chitrakote" in r["title"] for r in data["results"])
