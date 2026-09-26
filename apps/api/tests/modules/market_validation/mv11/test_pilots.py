def test_create_pilot_success(client, operator_headers):
    payload = {
        "name": "Bastar Ecotourism Pilot",
        "validation_decision_id": "MV10-DECISION-GO-002",
        "minimum_sample": 50,
        "target_sample": 200,
        "budget_band": "PILOT_TIER_1_INR_50K",
        "launch_owner": "PRODUCT_LEAD",
    }
    resp = client.post("/api/v1/market-validation/pilots", json=payload, headers=operator_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Bastar Ecotourism Pilot"
    assert data["status"] == "DRAFT"
    assert data["version"] == 1


def test_create_pilot_no_go_rejected(client, operator_headers):
    payload = {
        "name": "Invalid Pilot from No Go",
        "validation_decision_id": "MV10-DECISION-NO_GO-999",
    }
    resp = client.post("/api/v1/market-validation/pilots", json=payload, headers=operator_headers)
    assert resp.status_code == 400
    assert "MV10 is the decision authority" in resp.json()["detail"]


def test_list_pilots_default_seeding(client):
    resp = client.get("/api/v1/market-validation/pilots")
    assert resp.status_code == 200
    pilots = resp.json()
    assert len(pilots) >= 1
    assert "Bastar" in pilots[0]["name"]
