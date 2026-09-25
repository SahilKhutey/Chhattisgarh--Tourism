from fastapi.testclient import TestClient


def test_nearby_activation(client: TestClient, researcher_headers: dict):
    resp = client.get("/api/v1/market-validation/geography/analysis/nearby", headers=researcher_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_nearby_queries" in data
    assert "activation_rate" in data
    assert len(data["top_explored_destinations"]) > 0


def test_route_conversion(client: TestClient, researcher_headers: dict):
    # Add a route
    client.post(
        "/api/v1/market-validation/geography/routes/validate",
        json={"origin": "Raipur", "destination": "Kanker", "estimated_duration_minutes": 150},
        headers=researcher_headers,
    )
    resp = client.get("/api/v1/market-validation/geography/analysis/routes", headers=researcher_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_route_validations"] >= 1
    assert data["feasibility_rate"] >= 0.0


def test_discovery_expansion_rate(client: TestClient, researcher_headers: dict):
    resp = client.get("/api/v1/market-validation/geography/analysis/discovery", headers=researcher_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["discovery_expansion_rate"] > 1.0
    assert len(data["top_discovered_unplanned_places"]) >= 3


def test_geographic_utility(client: TestClient, researcher_headers: dict):
    resp = client.get(
        "/api/v1/market-validation/geography/analysis/geographic-utility?region_id=BASTAR",
        headers=researcher_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["region_id"] == "BASTAR"
    assert data["overall_utility_score"] >= 3.0
    assert data["decision_recommendation"] == "EXPAND_PILOT"


def test_regional_overview(client: TestClient, researcher_headers: dict):
    # Add destination and relationship
    client.post(
        "/api/v1/market-validation/geography/destinations",
        json={
            "region_id": "BASTAR",
            "destination_id": "DEST_PILOT_BASTAR",
            "destination_name": "Pilot Bastar Central",
            "district": "Bastar",
        },
        headers=researcher_headers,
    )
    resp = client.get(
        "/api/v1/market-validation/geography/analysis/regional-overview?region_id=BASTAR",
        headers=researcher_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["region_id"] == "BASTAR"
    assert data["total_destinations"] >= 1
    assert "geographic_jobs_progress" in data
