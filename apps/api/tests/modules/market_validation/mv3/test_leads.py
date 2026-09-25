import uuid
from fastapi.testclient import TestClient


def create_test_provider(client: TestClient, headers: dict) -> str:
    resp = client.post(
        "/api/v1/market-validation/providers",
        json={
            "provider_type": "LOCAL_GUIDE",
            "segment": "INDIVIDUAL",
            "business_name": "Kanger Valley Cave Guides",
            "geography": "BASTAR",
            "operating_area": "Kotumsar Cave",
        },
        headers=headers,
    )
    return resp.json()["id"]


def test_lead_creation(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    payload = {
        "provider_id": provider_id,
        "source": "DISCOVERY",
        "traveler_segment": "ECO_TOURIST",
        "destination": "Kanger Valley",
        "experience": "Kotumsar Cave Exploration",
        "request_type": "BOOKING_REQUEST",
    }
    resp = client.post("/api/v1/market-validation/leads", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["provider_id"] == provider_id
    assert data["status"] == "NEW"
    assert data["qualified"] is False
    assert "id" in data


def test_invalid_provider_rejected(client: TestClient, researcher_headers: dict):
    fake_id = str(uuid.uuid4())
    payload = {
        "provider_id": fake_id,
        "source": "DISCOVERY",
        "traveler_segment": "ECO_TOURIST",
        "destination": "Kanger Valley",
        "experience": "Kotumsar Cave Exploration",
        "request_type": "BOOKING_REQUEST",
    }
    resp = client.post("/api/v1/market-validation/leads", json=payload, headers=researcher_headers)
    assert resp.status_code == 404
    assert f"Provider {fake_id} not found" in resp.json()["detail"]


def test_lead_status_transition(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    resp = client.post(
        "/api/v1/market-validation/leads",
        json={
            "provider_id": provider_id,
            "source": "MAP_EXPLORER",
            "traveler_segment": "CULTURAL_EXPLORER",
            "destination": "Jagdalpur",
            "experience": "Weekly Haat Tour",
            "request_type": "EXPERIENCE_INQUIRY",
        },
        headers=researcher_headers,
    )
    lead_id = resp.json()["id"]

    patch_resp = client.patch(
        f"/api/v1/market-validation/leads/{lead_id}",
        json={"status": "CONTACTED"},
        headers=researcher_headers,
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "CONTACTED"


def test_qualified_lead(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    resp = client.post(
        "/api/v1/market-validation/leads",
        json={
            "provider_id": provider_id,
            "source": "ITINERARY_PLANNER",
            "traveler_segment": "FAMILY",
            "destination": "Chitrakote",
            "experience": "Boat Ride & Sunset",
            "request_type": "BOOKING_REQUEST",
        },
        headers=researcher_headers,
    )
    lead_id = resp.json()["id"]

    q_resp = client.post(f"/api/v1/market-validation/leads/{lead_id}/qualify", headers=researcher_headers)
    assert q_resp.status_code == 200
    assert q_resp.json()["qualified"] is True
    assert q_resp.json()["status"] == "QUALIFIED"


def test_lead_booking(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    resp = client.post(
        "/api/v1/market-validation/leads",
        json={
            "provider_id": provider_id,
            "source": "DESTINATION_PAGE",
            "traveler_segment": "SOLO_BACKPACKER",
            "destination": "Barsur",
            "experience": "Batasur Temple History Tour",
            "request_type": "PRICE_QUOTE",
        },
        headers=researcher_headers,
    )
    lead_id = resp.json()["id"]

    b_resp = client.post(
        f"/api/v1/market-validation/leads/{lead_id}/booking",
        json={"status": "BOOKED", "conversion_status": "CONVERTED", "outcome": "2_DAY_TOUR_CONFIRMED"},
        headers=researcher_headers,
    )
    assert b_resp.status_code == 200
    data = b_resp.json()
    assert data["status"] == "BOOKED"
    assert data["conversion_status"] == "CONVERTED"
    assert data["outcome"] == "2_DAY_TOUR_CONFIRMED"
