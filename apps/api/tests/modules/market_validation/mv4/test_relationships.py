import pytest
from fastapi.testclient import TestClient


def create_destination(client: TestClient, headers: dict, dest_id: str, name: str, lat: float, lon: float):
    payload = {
        "region_id": "BASTAR",
        "destination_id": dest_id,
        "destination_name": name,
        "district": "Bastar",
        "latitude": lat,
        "longitude": lon,
        "tourism_type": "WATERFALL",
        "validation_status": "VALIDATED",
    }
    resp = client.post("/api/v1/market-validation/geography/destinations", json=payload, headers=headers)
    assert resp.status_code == 201
    return resp.json()


def test_create_relationship(client: TestClient, researcher_headers: dict):
    create_destination(client, researcher_headers, "DEST_JAGDALPUR", "Jagdalpur City", 19.0735, 82.0289)
    create_destination(client, researcher_headers, "DEST_CHITRAKOTE", "Chitrakote Falls", 19.2017, 81.7061)

    payload = {
        "source_destination_id": "DEST_JAGDALPUR",
        "target_destination_id": "DEST_CHITRAKOTE",
        "relationship_type": "NEARBY",
        "evidence_type": "GEOSPATIAL_CALCULATION",
        "confidence": 0.94,
    }
    resp = client.post("/api/v1/market-validation/geography/relationships", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["source_destination_id"] == "DEST_JAGDALPUR"
    assert data["target_destination_id"] == "DEST_CHITRAKOTE"
    assert data["relationship_type"] == "NEARBY"
    assert data["confidence"] == 0.94
    assert data["straight_line_km"] is not None
    assert data["road_distance_km"] is not None
    assert data["estimated_travel_minutes"] is not None


def test_relationship_type_validation(client: TestClient, researcher_headers: dict):
    create_destination(client, researcher_headers, "DEST_JAGDALPUR", "Jagdalpur City", 19.0735, 82.0289)
    create_destination(client, researcher_headers, "DEST_CHITRAKOTE", "Chitrakote Falls", 19.2017, 81.7061)

    payload = {
        "source_destination_id": "DEST_JAGDALPUR",
        "target_destination_id": "DEST_CHITRAKOTE",
        "relationship_type": "INVALID_RELATIONSHIP_XYZ",
    }
    resp = client.post("/api/v1/market-validation/geography/relationships", json=payload, headers=researcher_headers)
    assert resp.status_code == 422


def test_duplicate_relationship(client: TestClient, researcher_headers: dict):
    create_destination(client, researcher_headers, "DEST_JAGDALPUR", "Jagdalpur City", 19.0735, 82.0289)
    create_destination(client, researcher_headers, "DEST_CHITRAKOTE", "Chitrakote Falls", 19.2017, 81.7061)

    payload = {
        "source_destination_id": "DEST_JAGDALPUR",
        "target_destination_id": "DEST_CHITRAKOTE",
        "relationship_type": "CONNECTED_BY_ROUTE",
    }
    resp1 = client.post("/api/v1/market-validation/geography/relationships", json=payload, headers=researcher_headers)
    assert resp1.status_code == 201

    resp2 = client.post("/api/v1/market-validation/geography/relationships", json=payload, headers=researcher_headers)
    assert resp2.status_code == 409


def test_invalid_place_reference(client: TestClient, researcher_headers: dict):
    create_destination(client, researcher_headers, "DEST_JAGDALPUR", "Jagdalpur City", 19.0735, 82.0289)

    payload = {
        "source_destination_id": "DEST_JAGDALPUR",
        "target_destination_id": "DEST_NON_EXISTENT_999",
        "relationship_type": "NEARBY",
    }
    resp = client.post("/api/v1/market-validation/geography/relationships", json=payload, headers=researcher_headers)
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"]


def test_relationship_confidence(client: TestClient, researcher_headers: dict):
    create_destination(client, researcher_headers, "DEST_JAGDALPUR", "Jagdalpur City", 19.0735, 82.0289)
    create_destination(client, researcher_headers, "DEST_TIRATHGARH", "Tirathgarh Falls", 18.9167, 81.8667)

    payload = {
        "source_destination_id": "DEST_JAGDALPUR",
        "target_destination_id": "DEST_TIRATHGARH",
        "relationship_type": "WITHIN_ZONE",
        "confidence": 0.88,
    }
    resp = client.post("/api/v1/market-validation/geography/relationships", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    assert resp.json()["confidence"] == 0.88
