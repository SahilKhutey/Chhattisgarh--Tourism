from fastapi.testclient import TestClient


def test_create_geo_experiment(client: TestClient, researcher_headers: dict):
    payload = {
        "experiment_key": "EXP-GEO-001",
        "name": "Nearby Discovery Contextual Panel Test",
        "hypothesis_key": "H-MV4-001",
        "status": "RUNNING",
        "control_description": "Standard destination page with photo and text only",
        "variant_description": "Contextual destination page with 10km, 25km, 50km nearby places",
        "primary_metric_name": "nearby_planning_activation_rate",
        "control_metric_value": 0.18,
        "variant_metric_value": 0.42,
        "sample_size_control": 50,
        "sample_size_variant": 50,
    }
    resp = client.post("/api/v1/market-validation/geography/experiments", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["experiment_key"] == "EXP-GEO-001"
    assert data["hypothesis_key"] == "H-MV4-001"
    # Lift: ((0.42 - 0.18) / 0.18) * 100 = 133.33%
    assert data["lift_percentage"] == 133.33


def test_assign_control_and_variant(client: TestClient, researcher_headers: dict):
    exp_resp = client.post(
        "/api/v1/market-validation/geography/experiments",
        json={
            "experiment_key": "EXP-GEO-002",
            "name": "Map-First vs List-First Discovery",
            "hypothesis_key": "H-MV4-002",
            "control_description": "Destination list view",
            "variant_description": "Map-first cluster exploration",
            "primary_metric_name": "places_explored",
            "control_metric_value": 2.5,
            "variant_metric_value": 5.8,
            "sample_size_control": 30,
            "sample_size_variant": 30,
        },
        headers=researcher_headers,
    )
    assert exp_resp.status_code == 201
    exp_id = exp_resp.json()["id"]

    # Update metrics after further testing
    patch_resp = client.patch(
        f"/api/v1/market-validation/geography/experiments/{exp_id}",
        json={
            "control_metric_value": 3.0,
            "variant_metric_value": 6.9,
            "sample_size_control": 60,
            "sample_size_variant": 60,
            "outcome": "VARIANT_STRONGLY_OUTPERFORMS",
        },
        headers=researcher_headers,
    )
    assert patch_resp.status_code == 200
    data = patch_resp.json()
    assert data["sample_size_variant"] == 60
    # Lift: ((6.9 - 3.0) / 3.0) * 100 = 130%
    assert data["lift_percentage"] == 130.0


def test_record_geo_observation(client: TestClient, researcher_headers: dict):
    payload = {
        "task_id": "TASK-BASTAR-3DAY",
        "source_place_id": "DEST_JAGDALPUR",
        "target_place_id": "DEST_CHITRAKOTE",
        "relationship_type": "NEARBY",
        "expected_relationship": "SAME_DAY_VISIT",
        "observed_behavior": "Participant combined Chitrakote with Tirathgarh on Day 1 after seeing 25km radius suggestion",
        "successful": True,
        "difficulty": 2,
        "confidence": 0.95,
        "evidence_type": "USER_OBSERVATION",
    }
    resp = client.post("/api/v1/market-validation/geography/experiments/observations", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["task_id"] == "TASK-BASTAR-3DAY"
    assert data["successful"] is True
    assert data["difficulty"] == 2
