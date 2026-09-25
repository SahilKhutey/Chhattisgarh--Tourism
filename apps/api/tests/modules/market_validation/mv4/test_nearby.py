from fastapi.testclient import TestClient


def setup_bastar_destinations(client: TestClient, headers: dict):
    destinations = [
        ("DEST_JAGDALPUR", "Jagdalpur", 19.0735, 82.0289, "HERITAGE"),
        ("DEST_CHITRAKOTE", "Chitrakote Falls", 19.2017, 81.7061, "WATERFALL"),  # ~38km
        ("DEST_TIRATHGARH", "Tirathgarh Falls", 18.9167, 81.8667, "WATERFALL"),  # ~24km
        ("DEST_KANGER_CAVE", "Kotumsar Cave", 18.8833, 81.9333, "WILDLIFE"),   # ~23km
        ("DEST_RAIPUR", "Raipur Capital", 21.2514, 81.6296, "GENERAL"),       # ~290km
    ]
    for d_id, name, lat, lon, t_type in destinations:
        client.post(
            "/api/v1/market-validation/geography/destinations",
            json={
                "region_id": "BASTAR" if "RAIPUR" not in d_id else "RAIPUR",
                "destination_id": d_id,
                "destination_name": name,
                "district": "Bastar" if "RAIPUR" not in d_id else "Raipur",
                "latitude": lat,
                "longitude": lon,
                "tourism_type": t_type,
                "validation_status": "VALIDATED",
            },
            headers=headers,
        )


def test_nearby_places(client: TestClient, researcher_headers: dict):
    setup_bastar_destinations(client, researcher_headers)

    resp = client.get(
        "/api/v1/market-validation/geography/relationships/nearby?destination_id=DEST_JAGDALPUR&radius_km=50",
        headers=researcher_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["source_destination_id"] == "DEST_JAGDALPUR"
    assert data["total"] >= 3
    # Chitrakote, Tirathgarh, Kotumsar should be present, Raipur (>200km) should NOT
    place_ids = [p["destination_id"] for p in data["places"]]
    assert "DEST_CHITRAKOTE" in place_ids
    assert "DEST_TIRATHGARH" in place_ids
    assert "DEST_KANGER_CAVE" in place_ids
    assert "DEST_RAIPUR" not in place_ids


def test_distance_filter(client: TestClient, researcher_headers: dict):
    setup_bastar_destinations(client, researcher_headers)

    # Within 30km: Tirathgarh (~24km) and Kotumsar (~23km) should be in, Chitrakote (~38km) out
    resp = client.get(
        "/api/v1/market-validation/geography/relationships/nearby?destination_id=DEST_JAGDALPUR&radius_km=30",
        headers=researcher_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    place_ids = [p["destination_id"] for p in data["places"]]
    assert "DEST_CHITRAKOTE" not in place_ids
    assert "DEST_TIRATHGARH" in place_ids


def test_radius_filter(client: TestClient, researcher_headers: dict):
    setup_bastar_destinations(client, researcher_headers)

    # Expanding radius to 350km includes Raipur
    resp = client.get(
        "/api/v1/market-validation/geography/relationships/nearby?destination_id=DEST_JAGDALPUR&radius_km=350",
        headers=researcher_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    place_ids = [p["destination_id"] for p in data["places"]]
    assert "DEST_RAIPUR" in place_ids


def test_nearby_sorting(client: TestClient, researcher_headers: dict):
    setup_bastar_destinations(client, researcher_headers)

    # Sort by distance
    resp = client.get(
        "/api/v1/market-validation/geography/relationships/nearby?destination_id=DEST_JAGDALPUR&radius_km=100&sort_by=distance",
        headers=researcher_headers,
    )
    assert resp.status_code == 200
    places = resp.json()["places"]
    distances = [p["distance_km"] for p in places]
    assert distances == sorted(distances)

    # Sort by relevance
    resp_rel = client.get(
        "/api/v1/market-validation/geography/relationships/nearby?destination_id=DEST_JAGDALPUR&radius_km=100&sort_by=relevance",
        headers=researcher_headers,
    )
    assert resp_rel.status_code == 200
    places_rel = resp_rel.json()["places"]
    scores = [p["geo_relevance_score"] for p in places_rel]
    assert scores == sorted(scores, reverse=True)
