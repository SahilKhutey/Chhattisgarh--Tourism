import uuid
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient


def create_test_provider(client: TestClient, headers: dict) -> str:
    resp = client.post(
        "/api/v1/market-validation/providers",
        json={
            "provider_type": "HOMESTAY",
            "segment": "MICRO_BUSINESS",
            "business_name": "Kondagaon Craft Stay",
            "geography": "BASTAR",
            "operating_area": "Kondagaon",
        },
        headers=headers,
    )
    return resp.json()["id"]


def test_response_time(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    resp = client.post(
        "/api/v1/market-validation/leads",
        json={
            "provider_id": provider_id,
            "source": "DISCOVERY",
            "traveler_segment": "ECO_TOURIST",
            "destination": "Kondagaon",
            "experience": "Pottery Workshop",
            "request_type": "BOOKING_REQUEST",
        },
        headers=researcher_headers,
    )
    lead_id = resp.json()["id"]
    created_at_str = resp.json()["created_at"]
    created_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))

    # Provider responds 30 minutes (1800 seconds) later
    response_at = created_at + timedelta(minutes=30)
    r_resp = client.post(
        f"/api/v1/market-validation/leads/{lead_id}/response",
        json={
            "response_at": response_at.isoformat(),
            "status": "RESPONDED",
            "outcome": "ACCEPTED_VIA_WHATSAPP",
        },
        headers=researcher_headers,
    )
    assert r_resp.status_code == 200
    data = r_resp.json()
    assert data["status"] == "RESPONDED"
    assert data["provider_response_at"] is not None
    assert data["response_time_seconds"] == 1800


def test_no_response(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    resp = client.post(
        "/api/v1/market-validation/leads",
        json={
            "provider_id": provider_id,
            "source": "DISCOVERY",
            "traveler_segment": "ECO_TOURIST",
            "destination": "Kondagaon",
            "experience": "Pottery Workshop",
            "request_type": "BOOKING_REQUEST",
        },
        headers=researcher_headers,
    )
    data = resp.json()
    assert data["provider_response_at"] is None
    assert data["response_time_seconds"] is None


def test_response_bucket(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    # Lead 1: responds in 15 mins (< 1h)
    resp1 = client.post(
        "/api/v1/market-validation/leads",
        json={
            "provider_id": provider_id,
            "source": "DISCOVERY",
            "traveler_segment": "ECO_TOURIST",
            "destination": "Kondagaon",
            "experience": "Pottery Workshop 1",
            "request_type": "BOOKING_REQUEST",
        },
        headers=researcher_headers,
    )
    lead1_id = resp1.json()["id"]
    t1 = datetime.fromisoformat(resp1.json()["created_at"].replace("Z", "+00:00")) + timedelta(minutes=15)
    client.post(
        f"/api/v1/market-validation/leads/{lead1_id}/response",
        json={"response_at": t1.isoformat(), "status": "RESPONDED"},
        headers=researcher_headers,
    )

    # Lead 2: responds in 2 hours (1h_to_4h)
    resp2 = client.post(
        "/api/v1/market-validation/leads",
        json={
            "provider_id": provider_id,
            "source": "DISCOVERY",
            "traveler_segment": "ECO_TOURIST",
            "destination": "Kondagaon",
            "experience": "Pottery Workshop 2",
            "request_type": "BOOKING_REQUEST",
        },
        headers=researcher_headers,
    )
    lead2_id = resp2.json()["id"]
    t2 = datetime.fromisoformat(resp2.json()["created_at"].replace("Z", "+00:00")) + timedelta(hours=2)
    client.post(
        f"/api/v1/market-validation/leads/{lead2_id}/response",
        json={"response_at": t2.isoformat(), "status": "RESPONDED"},
        headers=researcher_headers,
    )

    # Lead 3: no response
    client.post(
        "/api/v1/market-validation/leads",
        json={
            "provider_id": provider_id,
            "source": "DISCOVERY",
            "traveler_segment": "ECO_TOURIST",
            "destination": "Kondagaon",
            "experience": "Pottery Workshop 3",
            "request_type": "BOOKING_REQUEST",
        },
        headers=researcher_headers,
    )

    # Check analysis
    ana_resp = client.get("/api/v1/market-validation/analysis/provider-response", headers=researcher_headers)
    assert ana_resp.status_code == 200
    ana = ana_resp.json()
    assert ana["response_buckets"]["under_1h"] >= 1
    assert ana["response_buckets"]["1h_to_4h"] >= 1
    assert ana["response_buckets"]["no_response"] >= 1
