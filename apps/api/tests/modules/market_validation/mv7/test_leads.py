import uuid
from datetime import datetime, timezone
from fastapi.testclient import TestClient


def test_create_lead_success(client: TestClient, researcher_headers: dict, test_provider):
    payload = {
        "provider_id": str(test_provider.id),
        "consumer_id": "user_traveler_101",
        "anonymous_user_id": "anon_8832",
        "session_id": "sess_9912",
        "source": "THEMATIC_SEARCH",
        "destination_id": "DEST_CHITRAKOTE",
        "experience_id": "EXP_WATERFALL_TOUR",
        "request_type": "BOOKING_INQUIRY",
        "traveler_count": 3,
        "budget_band": "MID_RANGE",
        "message": "Looking for local tribal guide for Chitrakote and Tirathgarh on Saturday.",
    }
    resp = client.post("/api/v1/market-validation/transactions/leads", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["provider_id"] == str(test_provider.id)
    assert data["consumer_id"] == "user_traveler_101"
    assert data["source"] == "THEMATIC_SEARCH"
    assert data["traveler_count"] == 3
    assert data["qualification_status"] == "QUALIFIED"
    assert data["lead_id"].startswith("LEAD_")


def test_create_lead_duplicate_detection(client: TestClient, researcher_headers: dict, test_provider):
    payload = {
        "provider_id": str(test_provider.id),
        "consumer_id": "user_traveler_repeat",
        "experience_id": "EXP_WATERFALL_TOUR",
        "requested_date": datetime.now(timezone.utc).isoformat(),
        "source": "DIRECT",
        "message": "Booking inquiry repeat test.",
    }
    # First submission
    resp1 = client.post("/api/v1/market-validation/transactions/leads", json=payload, headers=researcher_headers)
    assert resp1.status_code == 201
    assert resp1.json()["disqualification_reason"] is None

    # Immediate duplicate submission
    resp2 = client.post("/api/v1/market-validation/transactions/leads", json=payload, headers=researcher_headers)
    assert resp2.status_code == 201
    data2 = resp2.json()
    assert data2["qualification_status"] == "DISQUALIFIED"
    assert data2["disqualification_reason"] == "DUPLICATE"


def test_list_leads_with_filters(client: TestClient, researcher_headers: dict, test_provider):
    # Create two leads
    for i in range(2):
        client.post(
            "/api/v1/market-validation/transactions/leads",
            json={
                "provider_id": str(test_provider.id),
                "consumer_id": f"consumer_{i}",
                "source": "MAP",
                "message": f"Lead message {i}",
            },
            headers=researcher_headers,
        )

    resp = client.get("/api/v1/market-validation/transactions/leads?source=MAP", headers=researcher_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 2
    assert all(item["source"] == "MAP" for item in data["items"])


def test_get_lead_by_id(client: TestClient, researcher_headers: dict, test_provider):
    create_resp = client.post(
        "/api/v1/market-validation/transactions/leads",
        json={
            "provider_id": str(test_provider.id),
            "consumer_id": "consumer_lookup",
            "message": "Lookup test lead",
        },
        headers=researcher_headers,
    )
    lead_id = create_resp.json()["id"]
    lead_key = create_resp.json()["lead_id"]

    # Lookup by UUID
    resp1 = client.get(f"/api/v1/market-validation/transactions/leads/{lead_id}", headers=researcher_headers)
    assert resp1.status_code == 200
    assert resp1.json()["id"] == lead_id

    # Lookup by string lead_id
    resp2 = client.get(f"/api/v1/market-validation/transactions/leads/{lead_key}", headers=researcher_headers)
    assert resp2.status_code == 200
    assert resp2.json()["lead_id"] == lead_key
