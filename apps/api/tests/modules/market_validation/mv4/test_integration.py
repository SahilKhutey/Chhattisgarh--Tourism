"""Integration tests for MV4 Regional & Geographic Validation.

Flow:
Destination -> Geo Relationship -> Nearby Places -> Observation -> Experiment Event -> Route Validation -> Regional Overview & Utility.
"""
from fastapi.testclient import TestClient


def test_full_geographic_validation_lifecycle(client: TestClient, researcher_headers: dict):
    # Step 1: Create Destinations in Bastar pilot region
    destinations = [
        {
            "region_id": "BASTAR",
            "destination_id": "DEST_JAGDALPUR",
            "destination_name": "Jagdalpur Urban Center",
            "district": "Bastar",
            "latitude": 19.0735,
            "longitude": 82.0289,
            "tourism_type": "HERITAGE",
            "validation_status": "VALIDATED",
        },
        {
            "region_id": "BASTAR",
            "destination_id": "DEST_CHITRAKOTE",
            "destination_name": "Chitrakote Falls",
            "district": "Bastar",
            "latitude": 19.2017,
            "longitude": 81.7061,
            "tourism_type": "WATERFALL",
            "validation_status": "VALIDATED",
        },
        {
            "region_id": "BASTAR",
            "destination_id": "DEST_TIRATHGARH",
            "destination_name": "Tirathgarh Falls",
            "district": "Bastar",
            "latitude": 18.9167,
            "longitude": 81.8667,
            "tourism_type": "WATERFALL",
            "validation_status": "VALIDATED",
        },
        {
            "region_id": "BASTAR",
            "destination_id": "DEST_KANGER_VALLEY",
            "destination_name": "Kanger Valley National Park & Caves",
            "district": "Bastar",
            "latitude": 18.8833,
            "longitude": 81.9333,
            "tourism_type": "WILDLIFE",
            "validation_status": "VALIDATED",
        },
        {
            "region_id": "BASTAR",
            "destination_id": "DEST_DANTEWADA",
            "destination_name": "Danteshwari Temple Dantewada",
            "district": "Dantewada",
            "latitude": 18.8950,
            "longitude": 81.3490,
            "tourism_type": "TEMPLE",
            "validation_status": "VALIDATED",
        },
    ]

    for d in destinations:
        resp = client.post(
            "/api/v1/market-validation/geography/destinations",
            json=d,
            headers=researcher_headers,
        )
        assert resp.status_code == 201

    # Step 2: Establish Geographic Relationships
    rel_payload = {
        "source_destination_id": "DEST_JAGDALPUR",
        "target_destination_id": "DEST_CHITRAKOTE",
        "relationship_type": "SAME_TRIP_CLUSTER",
        "confidence": 0.95,
        "evidence_type": "GEOSPATIAL_CALCULATION",
    }
    resp = client.post(
        "/api/v1/market-validation/geography/relationships",
        json=rel_payload,
        headers=researcher_headers,
    )
    assert resp.status_code == 201
    rel_id = resp.json()["id"]

    # Step 3: Query Nearby Places from Jagdalpur
    resp = client.get(
        "/api/v1/market-validation/geography/relationships/nearby?destination_id=DEST_JAGDALPUR&radius_km=50&sort_by=relevance",
        headers=researcher_headers,
    )
    assert resp.status_code == 200
    nearby_data = resp.json()
    assert nearby_data["source_destination_id"] == "DEST_JAGDALPUR"
    assert nearby_data["total"] >= 3
    found_dest_ids = [p["destination_id"] for p in nearby_data["places"]]
    assert "DEST_CHITRAKOTE" in found_dest_ids
    assert "DEST_TIRATHGARH" in found_dest_ids

    # Step 4: Create Geo Experiment & Record Behavioral Observation
    exp_payload = {
        "experiment_key": "EXP-GEO-E2E-001",
        "name": "Contextual Hub and Spoke Discovery",
        "hypothesis_key": "H-MV4-001",
        "status": "RUNNING",
        "control_description": "Isolated destination profile",
        "variant_description": "Contextual nearby cluster with travel times",
        "primary_metric_name": "cluster_exploration_rate",
        "control_metric_value": 0.22,
        "variant_metric_value": 0.58,
        "sample_size_control": 45,
        "sample_size_variant": 48,
    }
    exp_resp = client.post(
        "/api/v1/market-validation/geography/experiments",
        json=exp_payload,
        headers=researcher_headers,
    )
    assert exp_resp.status_code == 201
    exp_data = exp_resp.json()
    assert exp_data["lift_percentage"] > 100.0

    obs_payload = {
        "task_id": "TASK-E2E-EXP-1",
        "source_place_id": "DEST_JAGDALPUR",
        "target_place_id": "DEST_CHITRAKOTE",
        "relationship_type": "SAME_DAY_CLUSTER",
        "expected_relationship": "VISIT_CHITRAKOTE_AFTERNOON",
        "observed_behavior": "Traveler scheduled Chitrakote sunset visit and added nearby Tirathgarh for next morning",
        "successful": True,
        "difficulty": 1,
        "confidence": 0.98,
        "evidence_type": "BEHAVIORAL_TEST",
    }
    obs_resp = client.post(
        "/api/v1/market-validation/geography/experiments/observations",
        json=obs_payload,
        headers=researcher_headers,
    )
    assert obs_resp.status_code == 201

    # Step 5: Route Validation across Central to South Corridor
    route_payload = {
        "origin": "Raipur",
        "destination": "Jagdalpur",
        "intermediate_places": ["Kanker", "Kondagaon"],
        "estimated_duration_minutes": 390,
        "travel_mode": "CAR",
        "feasibility": "FEASIBLE",
        "evidence": "NH30 highway scenic transit with handicraft stop in Kondagaon",
    }
    route_resp = client.post(
        "/api/v1/market-validation/geography/routes/validate",
        json=route_payload,
        headers=researcher_headers,
    )
    assert route_resp.status_code == 201
    route_data = route_resp.json()
    assert route_data["feasibility"] == "FEASIBLE"
    assert len(route_data["intermediate_places"]) == 2

    # Step 6: Geographic Analysis & Regional Overview
    # 6a: Nearby analysis
    resp_nb = client.get("/api/v1/market-validation/geography/analysis/nearby", headers=researcher_headers)
    assert resp_nb.status_code == 200
    assert resp_nb.json()["activation_rate"] >= 0.0

    # 6b: Route analysis
    resp_rt = client.get("/api/v1/market-validation/geography/analysis/routes", headers=researcher_headers)
    assert resp_rt.status_code == 200
    assert resp_rt.json()["total_route_validations"] >= 1

    # 6c: Discovery analysis
    resp_disc = client.get("/api/v1/market-validation/geography/analysis/discovery", headers=researcher_headers)
    assert resp_disc.status_code == 200
    assert resp_disc.json()["discovery_expansion_rate"] > 1.0

    # 6d: Regional overview
    resp_reg = client.get(
        "/api/v1/market-validation/geography/analysis/regional-overview?region_id=BASTAR",
        headers=researcher_headers,
    )
    assert resp_reg.status_code == 200
    reg_data = resp_reg.json()
    assert reg_data["region_id"] == "BASTAR"
    assert reg_data["total_destinations"] == 5

    # 6e: Geographic Utility Score
    resp_util = client.get(
        "/api/v1/market-validation/geography/analysis/geographic-utility?region_id=BASTAR",
        headers=researcher_headers,
    )
    assert resp_util.status_code == 200
    util_data = resp_util.json()
    assert util_data["region_id"] == "BASTAR"
    assert util_data["overall_utility_score"] >= 3.0
    assert util_data["decision_recommendation"] in ["VALIDATE", "EXPAND_PILOT", "DEPLOY"]
