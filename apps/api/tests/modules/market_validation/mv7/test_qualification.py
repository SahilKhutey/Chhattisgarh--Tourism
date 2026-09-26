from fastapi.testclient import TestClient


def test_qualify_lead_success(client: TestClient, researcher_headers: dict, test_provider):
    create_resp = client.post(
        "/api/v1/market-validation/transactions/leads",
        json={
            "provider_id": str(test_provider.id),
            "consumer_id": "c_qualify",
            "message": "Hi",  # short message defaults to PENDING
        },
        headers=researcher_headers,
    )
    lead_id = create_resp.json()["id"]

    qual_resp = client.post(
        f"/api/v1/market-validation/transactions/leads/{lead_id}/qualify",
        json={"qualification_status": "QUALIFIED", "notes": "Verified verified phone and date"},
        headers=researcher_headers,
    )
    assert qual_resp.status_code == 200
    data = qual_resp.json()
    assert data["qualification_status"] == "QUALIFIED"
    assert data["qualified"] is True
    assert data["status"] == "QUALIFIED"


def test_disqualify_lead_with_reason(client: TestClient, researcher_headers: dict, test_provider):
    create_resp = client.post(
        "/api/v1/market-validation/transactions/leads",
        json={
            "provider_id": str(test_provider.id),
            "consumer_id": "c_disqualify",
            "message": "Out of area request",
        },
        headers=researcher_headers,
    )
    lead_id = create_resp.json()["id"]

    disq_resp = client.post(
        f"/api/v1/market-validation/transactions/leads/{lead_id}/qualify",
        json={
            "qualification_status": "DISQUALIFIED",
            "disqualification_reason": "OUT_OF_SERVICE_AREA",
            "notes": "Requested Sarguja from Bastar guide",
        },
        headers=researcher_headers,
    )
    assert disq_resp.status_code == 200
    data = disq_resp.json()
    assert data["qualification_status"] == "DISQUALIFIED"
    assert data["disqualification_reason"] == "OUT_OF_SERVICE_AREA"
    assert data["qualified"] is False
