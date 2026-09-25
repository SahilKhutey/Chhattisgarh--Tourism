from fastapi.testclient import TestClient


def test_route_validation(client: TestClient, researcher_headers: dict):
    payload = {
        "origin": "Raipur",
        "destination": "Jagdalpur",
        "estimated_duration_minutes": 360,
        "travel_mode": "CAR",
        "feasibility": "FEASIBLE",
        "evidence": "NH30 standard driving time 6 hours",
    }
    resp = client.post("/api/v1/market-validation/geography/routes/validate", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["origin"] == "Raipur"
    assert data["destination"] == "Jagdalpur"
    assert data["feasibility"] == "FEASIBLE"
    assert data["estimated_duration_minutes"] == 360


def test_route_intermediate_places(client: TestClient, researcher_headers: dict):
    payload = {
        "origin": "Raipur",
        "destination": "Jagdalpur",
        "intermediate_places": ["Kanker Palace", "Kondagaon Bell Metal Workshop"],
        "estimated_duration_minutes": 450,
        "travel_mode": "CAR",
    }
    resp = client.post("/api/v1/market-validation/geography/routes/validate", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert len(data["intermediate_places"]) == 2
    assert "Kanker Palace" in data["intermediate_places"]


def test_route_feasibility(client: TestClient, researcher_headers: dict):
    # Route with excessive non-stop driving (>840 mins) automatically categorized as UNREALISTIC
    payload_unrealistic = {
        "origin": "Ambikapur",
        "destination": "Sukma",
        "estimated_duration_minutes": 920,
        "travel_mode": "CAR",
        "intermediate_places": [],
    }
    resp = client.post("/api/v1/market-validation/geography/routes/validate", json=payload_unrealistic, headers=researcher_headers)
    assert resp.status_code == 201
    assert resp.json()["feasibility"] == "UNREALISTIC"

    # Route between 600 and 840 mins is DIFFICULT
    payload_difficult = {
        "origin": "Mainpat",
        "destination": "Jagdalpur",
        "estimated_duration_minutes": 680,
        "travel_mode": "BUS",
    }
    resp_diff = client.post("/api/v1/market-validation/geography/routes/validate", json=payload_difficult, headers=researcher_headers)
    assert resp_diff.status_code == 201
    assert resp_diff.json()["feasibility"] == "DIFFICULT"


def test_invalid_route(client: TestClient, researcher_headers: dict):
    payload = {
        "origin": "Jagdalpur",
        "destination": "Jagdalpur",  # Identical origin and destination!
        "estimated_duration_minutes": 60,
    }
    resp = client.post("/api/v1/market-validation/geography/routes/validate", json=payload, headers=researcher_headers)
    assert resp.status_code == 422
