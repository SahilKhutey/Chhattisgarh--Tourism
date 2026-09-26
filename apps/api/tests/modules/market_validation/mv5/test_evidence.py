from fastapi.testclient import TestClient


def create_sample_entry(client: TestClient, headers: dict) -> str:
    resp = client.post(
        "/api/v1/market-validation/content/entries",
        json={
            "content_id": "CONT_EVIDENCE_FIXTURE",
            "content_type": "DESTINATION",
            "title": "Tirathgarh Falls",
            "category": "WATERFALL",
            "short_description": "Block type waterfall on the Kanger river.",
            "governance_status": "CONTENT_VERIFIED",
        },
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.json()["id"]


def test_content_evidence(client: TestClient, researcher_headers: dict):
    entry_id = create_sample_entry(client, researcher_headers)
    payload = {
        "content_entry_id": entry_id,
        "claim": "Water flow is highest from August through October.",
        "field_name": "best_time",
        "source_type": "FIELD_OBSERVATION",
        "source_reference": "Monsoon hydrologist report 2026",
        "confidence": 0.95,
        "status": "UNVERIFIED",
    }
    resp = client.post("/api/v1/market-validation/content/evidence", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["claim"] == payload["claim"]
    assert data["source_type"] == "FIELD_OBSERVATION"
    assert data["confidence"] == 0.95


def test_evidence_source_required(client: TestClient, researcher_headers: dict):
    entry_id = create_sample_entry(client, researcher_headers)
    # Missing source_type
    resp = client.post(
        "/api/v1/market-validation/content/evidence",
        json={
            "content_entry_id": entry_id,
            "claim": "Open at 6 AM",
        },
        headers=researcher_headers,
    )
    assert resp.status_code == 422

    # Invalid source_type
    resp_inv = client.post(
        "/api/v1/market-validation/content/evidence",
        json={
            "content_entry_id": entry_id,
            "claim": "Open at 6 AM",
            "source_type": "INVALID_SOURCE_KIND",
        },
        headers=researcher_headers,
    )
    assert resp_inv.status_code == 422


def test_verification_state(client: TestClient, researcher_headers: dict):
    entry_id = create_sample_entry(client, researcher_headers)
    create_resp = client.post(
        "/api/v1/market-validation/content/evidence",
        json={
            "content_entry_id": entry_id,
            "claim": "Entry fee is ₹25 per adult.",
            "field_name": "fees",
            "source_type": "GOVERNMENT",
            "status": "UNVERIFIED",
        },
        headers=researcher_headers,
    )
    assert create_resp.status_code == 201
    ev_id = create_resp.json()["id"]

    verify_resp = client.post(
        f"/api/v1/market-validation/content/evidence/{ev_id}/verify",
        headers=researcher_headers,
    )
    assert verify_resp.status_code == 200
    v_data = verify_resp.json()
    assert v_data["status"] == "VERIFIED"
    assert v_data["verified_at"] is not None


def test_stale_content_detection(client: TestClient, researcher_headers: dict):
    entry_id = create_sample_entry(client, researcher_headers)
    create_resp = client.post(
        "/api/v1/market-validation/content/evidence",
        json={
            "content_entry_id": entry_id,
            "claim": "Temporary bridge under repair in 2025.",
            "source_type": "PROVIDER",
            "status": "STALE",
        },
        headers=researcher_headers,
    )
    assert create_resp.status_code == 201
    assert create_resp.json()["status"] == "STALE"


def test_contradicted_content(client: TestClient, researcher_headers: dict):
    entry_id = create_sample_entry(client, researcher_headers)
    # First evidence: Verified opening time is 9:00 AM
    ev1 = client.post(
        "/api/v1/market-validation/content/evidence",
        json={
            "content_entry_id": entry_id,
            "claim": "Opening hours 09:00 AM to 05:00 PM",
            "field_name": "opening_hours",
            "source_type": "GOVERNMENT",
            "status": "VERIFIED",
        },
        headers=researcher_headers,
    )
    assert ev1.status_code == 201
    assert ev1.json()["status"] == "VERIFIED"

    # Second evidence contradicts: local provider reports opens at 07:00 AM
    ev2 = client.post(
        "/api/v1/market-validation/content/evidence",
        json={
            "content_entry_id": entry_id,
            "claim": "Opening hours 07:00 AM to 06:00 PM",
            "field_name": "opening_hours",
            "source_type": "PROVIDER",
            "status": "UNVERIFIED",
        },
        headers=researcher_headers,
    )
    assert ev2.status_code == 201
    assert ev2.json()["status"] == "CONTRADICTED"
