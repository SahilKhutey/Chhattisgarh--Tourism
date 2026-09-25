import uuid
from fastapi.testclient import TestClient


def test_create_provider(client: TestClient, researcher_headers: dict):
    payload = {
        "provider_type": "HOMESTAY",
        "segment": "MICRO_BUSINESS",
        "business_name": "Bastar Tribal Heritage Homestay",
        "geography": "BASTAR",
        "operating_area": "Jagdalpur",
        "verification_status": "UNVERIFIED",
        "digital_presence": "BASIC_DIGITAL",
        "acquisition_channels": ["WORD_OF_MOUTH", "WHATSAPP"],
        "booking_method": "WHATSAPP",
        "response_method": "PHONE",
        "current_demand": "LOW",
        "desired_demand": "HIGH",
        "willingness_to_participate": True,
        "willingness_to_pay": "COMMISSION",
    }
    resp = client.post("/api/v1/market-validation/providers", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["business_name"] == "Bastar Tribal Heritage Homestay"
    assert data["provider_type"] == "HOMESTAY"
    assert data["segment"] == "MICRO_BUSINESS"
    assert "id" in data


def test_provider_type_validation(client: TestClient, researcher_headers: dict):
    payload = {
        "provider_type": "INVALID_TYPE_XYZ",
        "segment": "MICRO_BUSINESS",
        "business_name": "Fake Provider",
        "geography": "RAIPUR",
        "operating_area": "Raipur",
    }
    resp = client.post("/api/v1/market-validation/providers", json=payload, headers=researcher_headers)
    assert resp.status_code == 422


def test_provider_segment_validation(client: TestClient, researcher_headers: dict):
    payload = {
        "provider_type": "HOMESTAY",
        "segment": "INVALID_SEGMENT_123",
        "business_name": "Fake Provider",
        "geography": "RAIPUR",
        "operating_area": "Raipur",
    }
    resp = client.post("/api/v1/market-validation/providers", json=payload, headers=researcher_headers)
    assert resp.status_code == 422


def test_duplicate_canonical_provider(client: TestClient, researcher_headers: dict):
    canonical_id = str(uuid.uuid4())
    payload = {
        "canonical_provider_id": canonical_id,
        "provider_type": "LOCAL_GUIDE",
        "segment": "INDIVIDUAL",
        "business_name": "Chitrakote Explorer Guides",
        "geography": "BASTAR",
        "operating_area": "Chitrakote",
    }
    resp1 = client.post("/api/v1/market-validation/providers", json=payload, headers=researcher_headers)
    assert resp1.status_code == 201

    resp2 = client.post("/api/v1/market-validation/providers", json=payload, headers=researcher_headers)
    assert resp2.status_code == 409


def test_provider_research_record(client: TestClient, researcher_headers: dict):
    p_resp = client.post(
        "/api/v1/market-validation/providers",
        json={
            "provider_type": "ARTISAN",
            "segment": "COMMUNITY",
            "business_name": "Kondagaon Bell Metal Artisans",
            "geography": "BASTAR",
            "operating_area": "Kondagaon",
        },
        headers=researcher_headers,
    )
    provider_id = p_resp.json()["id"]

    research_payload = {
        "researcher_id": "RS-01",
        "interview_date": "2026-09-25T10:00:00Z",
        "duration_minutes": 45,
        "acquisition_channels": ["WALK_IN", "LOCAL_DEALER"],
        "booking_channels": ["DIRECT"],
        "operational_tools": ["PAPER_NOTEBOOK"],
        "current_pain": "Tourist flow is highly seasonal, no direct contact with travelers",
        "desired_outcome": "Steady orders and fair prices without middlemen",
        "demand_problem": "Off-season volume collapse",
        "digital_problem": "Lack of online presence",
        "trust_problem": "Payment delays from city middlemen",
    }
    r_resp = client.post(
        f"/api/v1/market-validation/providers/{provider_id}/research",
        json=research_payload,
        headers=researcher_headers,
    )
    assert r_resp.status_code == 201
    r_data = r_resp.json()
    assert r_data["provider_id"] == provider_id
    assert r_data["duration_minutes"] == 45
    assert "demand_problem" in r_data
