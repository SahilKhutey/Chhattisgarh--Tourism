import uuid
from fastapi.testclient import TestClient


def create_test_provider(client: TestClient, headers: dict) -> str:
    resp = client.post(
        "/api/v1/market-validation/providers",
        json={
            "provider_type": "HOMESTAY",
            "segment": "MICRO_BUSINESS",
            "business_name": "Mainpat Highland Camp",
            "geography": "SURGUJA",
            "operating_area": "Mainpat",
            "willingness_to_pay": "COMMISSION",
        },
        headers=headers,
    )
    return resp.json()["id"]


def test_provider_value(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    resp = client.get(f"/api/v1/market-validation/provider-metrics/{provider_id}", headers=researcher_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["provider_id"] == provider_id
    assert data["bookings"] == 0
    assert data["estimated_revenue"] == 0.0


def test_conversion_rate(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)

    # Update metric directly with 10 qualified leads and 4 bookings
    resp = client.patch(
        f"/api/v1/market-validation/provider-metrics/{provider_id}",
        json={
            "qualified_leads": 10,
            "bookings": 4,
            "estimated_revenue": 16000.0,
        },
        headers=researcher_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["qualified_leads"] == 10
    assert data["bookings"] == 4
    # Conversion rate: 4 / 10 = 0.4
    assert data["conversion_rate"] == 0.4


def test_completed_experience_metric(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    resp = client.patch(
        f"/api/v1/market-validation/provider-metrics/{provider_id}",
        json={
            "completed_services": 8,
            "estimated_revenue": 32000.0,
            "perceived_value": "HIGH",
        },
        headers=researcher_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["completed_services"] == 8
    assert data["estimated_revenue"] == 32000.0
    assert data["perceived_value"] == "HIGH"


def test_recalculate_metrics(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)

    # Create 2 leads: 1 booked, 1 qualified
    lead1 = client.post(
        "/api/v1/market-validation/leads",
        json={
            "provider_id": provider_id,
            "source": "DISCOVERY",
            "traveler_segment": "ECO_TOURIST",
            "destination": "Mainpat",
            "experience": "Tibetan Settlement Tour",
            "request_type": "BOOKING_REQUEST",
            "qualified": True,
            "status": "BOOKED",
        },
        headers=researcher_headers,
    ).json()

    lead2 = client.post(
        "/api/v1/market-validation/leads",
        json={
            "provider_id": provider_id,
            "source": "DISCOVERY",
            "traveler_segment": "ECO_TOURIST",
            "destination": "Mainpat",
            "experience": "Tiger Point Trek",
            "request_type": "BOOKING_REQUEST",
            "qualified": True,
            "status": "QUALIFIED",
        },
        headers=researcher_headers,
    ).json()

    # Recalculate metrics
    rec_resp = client.post(
        f"/api/v1/market-validation/provider-metrics/{provider_id}/recalculate",
        headers=researcher_headers,
    )
    assert rec_resp.status_code == 200
    data = rec_resp.json()
    assert data["contacts"] == 2
    assert data["qualified_leads"] == 2
    assert data["bookings"] == 1
    assert data["conversion_rate"] == 0.5
