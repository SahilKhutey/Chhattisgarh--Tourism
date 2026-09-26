from fastapi.testclient import TestClient


def test_next_trip_rate_calculation(client: TestClient, researcher_headers: dict):
    # User creates trip 1, completes it, creates trip 2
    u1 = "traveler-nt-1"
    client.post(
        "/api/v1/market-validation/retention/action",
        json={"anonymous_user_id": u1, "action_type": "TRIP_CREATION"},
        headers=researcher_headers,
    )
    client.post(f"/api/v1/market-validation/retention/consumers/{u1}/complete-trip", headers=researcher_headers)
    client.post(
        "/api/v1/market-validation/retention/action",
        json={"anonymous_user_id": u1, "action_type": "TRIP_CREATION"},
        headers=researcher_headers,
    )

    resp = client.get("/api/v1/market-validation/retention/next-trip", headers=researcher_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["completed_first_trip_count"] == 1
    assert data["started_second_trip_count"] == 1
    assert data["next_trip_rate"] == 1.0
