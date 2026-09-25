import uuid
from fastapi.testclient import TestClient


def create_test_provider(client: TestClient, headers: dict) -> str:
    resp = client.post(
        "/api/v1/market-validation/providers",
        json={
            "provider_type": "TOUR_OPERATOR",
            "segment": "SMALL_BUSINESS",
            "business_name": "Dandakaranya Eco Trails",
            "geography": "BASTAR",
            "operating_area": "Jagdalpur & Kanger Valley",
        },
        headers=headers,
    )
    return resp.json()["id"]


def test_listing_creation(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    payload = {
        "provider_id": provider_id,
        "template_id": "ECO_EXPEDITION_V1",
        "status": "DRAFT",
        "information_score": 80,
        "media_score": 60,
        "location_score": 90,
        "service_score": 75,
        "contact_score": 85,
        "trust_score": 70,
    }
    resp = client.post("/api/v1/market-validation/listings", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["provider_id"] == provider_id
    assert data["status"] == "DRAFT"
    # Average of 80, 60, 90, 75, 85, 70 = 460 / 6 = 76.666 -> 77
    assert data["listing_quality_score"] == 77


def test_listing_quality_score(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    payload = {
        "provider_id": provider_id,
        "template_id": "ECO_EXPEDITION_V1",
        "status": "DRAFT",
        "information_score": 80,
        "media_score": 70,
        "location_score": 90,
        "service_score": 60,
        "contact_score": 100,
        "trust_score": 80,
    }
    resp = client.post("/api/v1/market-validation/listings", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    data = resp.json()
    # (80+70+90+60+100+80) / 6 = 480 / 6 = 80
    assert data["listing_quality_score"] == 80


def test_missing_location_rejected(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    payload = {
        "provider_id": provider_id,
        "template_id": "ECO_EXPEDITION_V1",
        "status": "DRAFT",
        "information_score": 80,
        "media_score": 80,
        "location_score": 0,  # Missing location!
        "service_score": 80,
        "contact_score": 80,
        "trust_score": 80,
    }
    resp = client.post("/api/v1/market-validation/listings", json=payload, headers=researcher_headers)
    listing_id = resp.json()["id"]

    # Attempting to publish should be rejected
    pub_resp = client.post(f"/api/v1/market-validation/listings/{listing_id}/publish", headers=researcher_headers)
    assert pub_resp.status_code == 400
    assert "location details" in pub_resp.json()["detail"]


def test_missing_contact_rejected(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    payload = {
        "provider_id": provider_id,
        "template_id": "ECO_EXPEDITION_V1",
        "status": "DRAFT",
        "information_score": 80,
        "media_score": 80,
        "location_score": 80,
        "service_score": 80,
        "contact_score": 0,  # Missing contact!
        "trust_score": 80,
    }
    resp = client.post("/api/v1/market-validation/listings", json=payload, headers=researcher_headers)
    listing_id = resp.json()["id"]

    pub_resp = client.post(f"/api/v1/market-validation/listings/{listing_id}/publish", headers=researcher_headers)
    assert pub_resp.status_code == 400
    assert "contact details" in pub_resp.json()["detail"]


def test_listing_publish_validation(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    payload = {
        "provider_id": provider_id,
        "template_id": "ECO_EXPEDITION_V1",
        "status": "DRAFT",
        "information_score": 80,
        "media_score": 80,
        "location_score": 90,
        "service_score": 85,
        "contact_score": 95,
        "trust_score": 85,
    }
    resp = client.post("/api/v1/market-validation/listings", json=payload, headers=researcher_headers)
    listing_id = resp.json()["id"]

    pub_resp = client.post(f"/api/v1/market-validation/listings/{listing_id}/publish", headers=researcher_headers)
    assert pub_resp.status_code == 200
    data = pub_resp.json()
    assert data["status"] == "PUBLISHED"
    assert data["published_at"] is not None
