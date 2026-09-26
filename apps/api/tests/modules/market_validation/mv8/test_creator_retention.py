from fastapi.testclient import TestClient


def test_creator_activity_and_loop_metrics(client: TestClient, researcher_headers: dict):
    creator_id = "creator-aarav-bastar"

    # 1. Content submitted
    resp1 = client.post(
        "/api/v1/market-validation/retention/creators/activity",
        json={
            "creator_id": creator_id,
            "activity_type": "CONTENT_SUBMITTED",
            "count": 3,
        },
        headers=researcher_headers,
    )
    assert resp1.status_code == 200
    c1 = resp1.json()
    assert c1["content_submitted_count"] == 3
    assert c1["retention_state"] == "ACTIVE"

    # 2. Content published and views accrued
    client.post(
        "/api/v1/market-validation/retention/creators/activity",
        json={"creator_id": creator_id, "activity_type": "CONTENT_PUBLISHED", "count": 2},
        headers=researcher_headers,
    )
    client.post(
        "/api/v1/market-validation/retention/creators/activity",
        json={"creator_id": creator_id, "activity_type": "VIEW_ACCRUED", "count": 250},
        headers=researcher_headers,
    )
    resp3 = client.post(
        "/api/v1/market-validation/retention/creators/activity",
        json={"creator_id": creator_id, "activity_type": "TRIP_INFLUENCED", "count": 5},
        headers=researcher_headers,
    )
    assert resp3.status_code == 200
    assert resp3.json()["downstream_trips_influenced"] == 5

    # 3. Check loop metrics
    metrics_resp = client.get("/api/v1/market-validation/retention/creators", headers=researcher_headers)
    assert metrics_resp.status_code == 200
    data = metrics_resp.json()
    assert data["total_active_creators"] >= 1
    assert data["total_trips_influenced"] >= 5
