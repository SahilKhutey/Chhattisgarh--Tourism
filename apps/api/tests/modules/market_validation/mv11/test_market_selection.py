def test_market_selection_scoring_order(client):
    resp = client.get("/api/v1/market-validation/market-selection")
    assert resp.status_code == 200
    markets = resp.json()
    assert len(markets) == 4
    # Bastar should rank #1 due to highest composite score
    assert markets[0]["geography_id"] == "Bastar"
    assert markets[0]["pilot_priority"] == 1
    assert markets[0]["recommendation"] == "RECOMMENDED_PILOT"
    assert markets[0]["composite_score"] > 70.0


def test_add_market_candidate(client, operator_headers):
    payload = {
        "geography_id": "Dhamtari",
        "demand_score": 60.0,
        "supply_score": 55.0,
        "content_score": 50.0,
        "geographic_score": 58.0,
        "accessibility_score": 75.0,
        "operational_score": 60.0,
        "risk_score": 15.0,
    }
    resp = client.post("/api/v1/market-validation/market-selection", json=payload, headers=operator_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["geography_id"] == "Dhamtari"
    assert data["composite_score"] > 0
