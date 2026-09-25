from __future__ import annotations

import pytest


def test_create_participant(client, researcher_headers):
    payload = {
        "segment": "INTERSTATE_TRAVELER",
        "traveler_type": ["SOLO_TRAVELER", "BACKPACKER"],
        "origin_region": "Bengaluru",
        "age_band": "25-34",
        "travel_frequency": "FREQUENT",
        "cg_visit_history": "NEVER",
        "planning_method": "GOOGLE_SEARCH",
        "preferred_language": "en",
        "recruitment_source": "DIRECT_OUTREACH",
        "consent_status": True,
    }
    response = client.post(
        "/api/v1/market-validation/participants",
        json=payload,
        headers=researcher_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["segment"] == "INTERSTATE_TRAVELER"
    assert data["origin_region"] == "Bengaluru"
    assert "anonymous_id" in data
    assert data["anonymous_id"].startswith("PART-")


def test_anonymous_id_generated(client, researcher_headers):
    payload = {
        "segment": "LOCAL_RESIDENT",
        "traveler_type": ["FAMILY"],
        "origin_region": "Raipur",
        "age_band": "35-49",
        "travel_frequency": "OCCASIONAL",
        "cg_visit_history": "RESIDENT",
        "planning_method": "FRIENDS_AND_FAMILY",
        "recruitment_source": "COMMUNITY",
        "consent_status": True,
    }
    res1 = client.post("/api/v1/market-validation/participants", json=payload, headers=researcher_headers)
    res2 = client.post("/api/v1/market-validation/participants", json=payload, headers=researcher_headers)
    assert res1.status_code == 201
    assert res2.status_code == 201
    id1 = res1.json()["anonymous_id"]
    id2 = res2.json()["anonymous_id"]
    assert id1 != id2
    assert id1.startswith("PART-")
    assert id2.startswith("PART-")


def test_invalid_segment_rejected(client, researcher_headers):
    payload = {
        "segment": "INVALID_ALIEN_SEGMENT",
        "traveler_type": ["SOLO_TRAVELER"],
        "origin_region": "Delhi",
        "age_band": "18-24",
        "travel_frequency": "OCCASIONAL",
        "cg_visit_history": "NEVER",
        "planning_method": "INSTAGRAM",
        "recruitment_source": "SOCIAL",
        "consent_status": True,
    }
    response = client.post(
        "/api/v1/market-validation/participants",
        json=payload,
        headers=researcher_headers,
    )
    assert response.status_code in (422, 400)


def test_consent_required(client, researcher_headers):
    payload = {
        "segment": "CULTURAL_TRAVELER",
        "traveler_type": ["CULTURAL_TRAVELER"],
        "origin_region": "Mumbai",
        "age_band": "25-34",
        "travel_frequency": "FREQUENT",
        "cg_visit_history": "ONCE",
        "planning_method": "YOUTUBE",
        "recruitment_source": "COMMUNITY",
        "consent_status": False,
    }
    response = client.post(
        "/api/v1/market-validation/participants",
        json=payload,
        headers=researcher_headers,
    )
    assert response.status_code in (422, 400)


def test_sensitive_field_rejected(client, researcher_headers):
    payload = {
        "segment": "INTERSTATE_TRAVELER",
        "traveler_type": ["SOLO_TRAVELER"],
        "origin_region": "Delhi",
        "age_band": "25-34",
        "travel_frequency": "FREQUENT",
        "cg_visit_history": "NEVER",
        "planning_method": "GOOGLE_SEARCH",
        "recruitment_source": "DIRECT_OUTREACH",
        "consent_status": True,
        "phone": "+919876543210",
        "aadhaar": "1234-5678-9012",
    }
    response = client.post(
        "/api/v1/market-validation/participants",
        json=payload,
        headers=researcher_headers,
    )
    assert response.status_code in (422, 400)


def test_unauthorized_access_rejected(client):
    response = client.get("/api/v1/market-validation/participants")
    assert response.status_code in (401, 403)
