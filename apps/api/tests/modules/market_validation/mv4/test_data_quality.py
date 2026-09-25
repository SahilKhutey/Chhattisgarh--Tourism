import pytest
from fastapi.testclient import TestClient


def test_invalid_coordinates_rejected(client: TestClient, researcher_headers: dict):
    # Invalid latitude > 90
    resp_lat = client.post(
        "/api/v1/market-validation/geography/destinations",
        json={
            "region_id": "BASTAR",
            "destination_id": "DEST_INVALID_LAT",
            "destination_name": "Invalid Lat Place",
            "district": "Bastar",
            "latitude": 95.0,  # Invalid!
            "longitude": 81.5,
        },
        headers=researcher_headers,
    )
    assert resp_lat.status_code == 422

    # Invalid longitude > 180
    resp_lon = client.post(
        "/api/v1/market-validation/geography/destinations",
        json={
            "region_id": "BASTAR",
            "destination_id": "DEST_INVALID_LON",
            "destination_name": "Invalid Lon Place",
            "district": "Bastar",
            "latitude": 19.5,
            "longitude": 185.0,  # Invalid!
        },
        headers=researcher_headers,
    )
    assert resp_lon.status_code == 422


def test_duplicate_destination_id_rejected(client: TestClient, researcher_headers: dict):
    payload = {
        "region_id": "BASTAR",
        "destination_id": "DEST_DUPLICATE_CHECK",
        "destination_name": "Original Place",
        "district": "Bastar",
    }
    resp1 = client.post("/api/v1/market-validation/geography/destinations", json=payload, headers=researcher_headers)
    assert resp1.status_code == 201

    resp2 = client.post("/api/v1/market-validation/geography/destinations", json=payload, headers=researcher_headers)
    assert resp2.status_code == 409


def test_self_referential_relationship_rejected(client: TestClient, researcher_headers: dict):
    client.post(
        "/api/v1/market-validation/geography/destinations",
        json={
            "region_id": "BASTAR",
            "destination_id": "DEST_SELF_REF",
            "destination_name": "Self Ref Place",
            "district": "Bastar",
        },
        headers=researcher_headers,
    )
    payload = {
        "source_destination_id": "DEST_SELF_REF",
        "target_destination_id": "DEST_SELF_REF",  # Same place!
        "relationship_type": "NEARBY",
    }
    resp = client.post("/api/v1/market-validation/geography/relationships", json=payload, headers=researcher_headers)
    assert resp.status_code == 422


def test_invalid_region_rejected(client: TestClient, researcher_headers: dict):
    payload = {
        "region_id": "NON_EXISTENT_REGION",
        "destination_id": "DEST_INVALID_REGION",
        "destination_name": "Invalid Region Place",
        "district": "Bastar",
    }
    resp = client.post("/api/v1/market-validation/geography/destinations", json=payload, headers=researcher_headers)
    assert resp.status_code == 422


def test_impossible_route_flagged(client: TestClient, researcher_headers: dict):
    payload = {
        "origin": "Jagdalpur",
        "destination": "Dantewada",
        "estimated_duration_minutes": 1400,  # 23 hours for a 85km drive!
        "travel_mode": "CAR",
    }
    resp = client.post("/api/v1/market-validation/geography/routes/validate", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    assert resp.json()["feasibility"] == "UNREALISTIC"
