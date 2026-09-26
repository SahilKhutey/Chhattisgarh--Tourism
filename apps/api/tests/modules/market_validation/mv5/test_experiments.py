from fastapi.testclient import TestClient


def test_experiment_creation(client: TestClient, researcher_headers: dict):
    payload = {
        "experiment_key": "EXP-CONT-001",
        "name": "Generic vs Structured Destination Profile",
        "hypothesis_key": "H-MV5-001",
        "status": "RUNNING",
        "control_version": {
            "title": "Chitrakote Falls",
            "format": "GENERIC_DESCRIPTION",
            "sections": ["overview", "photo"],
        },
        "variant_version": {
            "title": "Chitrakote Falls - Comprehensive Guide",
            "format": "STRUCTURED_CANONICAL",
            "sections": [
                "what_is_it",
                "why_visit",
                "what_to_do",
                "duration",
                "how_to_reach",
                "when_to_visit",
                "nearby",
                "practical",
                "verified_info",
            ],
        },
        "primary_metric": "destination_to_planning_activation",
        "control_metric_value": 0.12,
        "variant_metric_value": 0.28,
        "sample_size_control": 50,
        "sample_size_variant": 50,
    }
    resp = client.post("/api/v1/market-validation/content/experiments", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["experiment_key"] == "EXP-CONT-001"
    # Lift: ((0.28 - 0.12) / 0.12) * 100 = 133.33%
    assert data["lift_percentage"] == 133.33


def test_variant_assignment(client: TestClient, researcher_headers: dict):
    # Create experiment
    exp_resp = client.post(
        "/api/v1/market-validation/content/experiments",
        json={
            "experiment_key": "EXP-CONT-002",
            "name": "Content Plus Geography Test",
            "hypothesis_key": "H-MV5-002",
            "status": "RUNNING",
            "control_version": {"view": "CONTENT_ONLY"},
            "variant_version": {"view": "CONTENT_PLUS_GEO"},
            "primary_metric": "places_discovered",
        },
        headers=researcher_headers,
    )
    assert exp_resp.status_code == 201
    exp_id = exp_resp.json()["id"]

    # Assign user
    assign_resp = client.post(
        f"/api/v1/market-validation/content/experiments/{exp_id}/assign",
        json={"anonymous_user_id": "anon-traveler-999"},
    )
    assert assign_resp.status_code == 200
    data = assign_resp.json()
    assert data["assigned_variant"] in {"CONTROL", "VARIANT"}
    assert "assigned_content" in data


def test_deterministic_assignment(client: TestClient, researcher_headers: dict):
    exp_resp = client.post(
        "/api/v1/market-validation/content/experiments",
        json={
            "experiment_key": "EXP-CONT-003",
            "name": "Practical Information Impact",
            "hypothesis_key": "H-MV5-003",
            "status": "RUNNING",
            "control_version": {"practical": False},
            "variant_version": {"practical": True},
            "primary_metric": "planning_rate",
        },
        headers=researcher_headers,
    )
    exp_id = exp_resp.json()["id"]

    user_id = "sticky-session-user-12345"

    # First assignment
    resp1 = client.post(f"/api/v1/market-validation/content/experiments/{exp_id}/assign", json={"anonymous_user_id": user_id})
    assert resp1.status_code == 200
    variant1 = resp1.json()["assigned_variant"]

    # Second assignment with same user_id must match perfectly
    resp2 = client.post(f"/api/v1/market-validation/content/experiments/{exp_id}/assign", json={"anonymous_user_id": user_id})
    assert resp2.status_code == 200
    variant2 = resp2.json()["assigned_variant"]

    assert variant1 == variant2


def test_experiment_state(client: TestClient, researcher_headers: dict):
    exp_resp = client.post(
        "/api/v1/market-validation/content/experiments",
        json={
            "experiment_key": "EXP-CONT-004",
            "name": "Cultural Storytelling Impact",
            "hypothesis_key": "H-MV5-004",
            "status": "DRAFT",
            "control_version": {"cultural": False},
            "variant_version": {"cultural": True},
            "primary_metric": "engagement_seconds",
        },
        headers=researcher_headers,
    )
    exp_id = exp_resp.json()["id"]

    # Patch status to RUNNING
    patch_resp = client.patch(
        f"/api/v1/market-validation/content/experiments/{exp_id}",
        json={"status": "RUNNING", "outcome": "VARIANT_STRONGLY_OUTPERFORMS"},
        headers=researcher_headers,
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "RUNNING"
    assert patch_resp.json()["outcome"] == "VARIANT_STRONGLY_OUTPERFORMS"


def test_metric_recording(client: TestClient, researcher_headers: dict):
    exp_resp = client.post(
        "/api/v1/market-validation/content/experiments",
        json={
            "experiment_key": "EXP-CONT-005",
            "name": "Content Trust Indicators",
            "hypothesis_key": "H-MV5-005",
            "status": "RUNNING",
            "control_version": {"trust_badges": False},
            "variant_version": {"trust_badges": True},
            "primary_metric": "save_rate",
            "control_metric_value": 0.10,
            "variant_metric_value": 0.20,
        },
        headers=researcher_headers,
    )
    exp_id = exp_resp.json()["id"]
    assert exp_resp.json()["lift_percentage"] == 100.0

    # Update metrics with new cohort results
    update_resp = client.patch(
        f"/api/v1/market-validation/content/experiments/{exp_id}",
        json={
            "control_metric_value": 0.10,
            "variant_metric_value": 0.25,
            "sample_size_control": 100,
            "sample_size_variant": 100,
        },
        headers=researcher_headers,
    )
    assert update_resp.status_code == 200
    # Lift: ((0.25 - 0.10) / 0.10) * 100 = 150.0%
    assert update_resp.json()["lift_percentage"] == 150.0
