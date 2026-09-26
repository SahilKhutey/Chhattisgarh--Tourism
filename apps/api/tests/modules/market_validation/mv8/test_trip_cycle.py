from fastapi.testclient import TestClient


def test_trip_cycle_retention_calculation(client: TestClient, researcher_headers: dict):
    # User 1: Completes journey, returns for next task
    u1 = "traveler-tc-1"
    client.post(
        "/api/v1/market-validation/retention/action",
        json={"anonymous_user_id": u1, "action_type": "TRIP_CREATION"},
        headers=researcher_headers,
    )
    client.post(f"/api/v1/market-validation/retention/consumers/{u1}/complete-trip", headers=researcher_headers)
    client.post(
        "/api/v1/market-validation/retention/action",
        json={"anonymous_user_id": u1, "action_type": "NEW_DESTINATION_DISCOVERY"},
        headers=researcher_headers,
    )

    # User 2: Completes journey, has not returned yet
    u2 = "traveler-tc-2"
    client.post(
        "/api/v1/market-validation/retention/action",
        json={"anonymous_user_id": u2, "action_type": "TRIP_CREATION"},
        headers=researcher_headers,
    )
    client.post(f"/api/v1/market-validation/retention/consumers/{u2}/complete-trip", headers=researcher_headers)

    # User 3: Only browsing (did not complete journey)
    u3 = "traveler-tc-3"
    client.post(
        "/api/v1/market-validation/retention/action",
        json={"anonymous_user_id": u3, "action_type": "DESTINATION_DISCOVERY"},
        headers=researcher_headers,
    )

    resp = client.get("/api/v1/market-validation/retention/trip-cycle", headers=researcher_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["completed_first_journey_count"] == 2
    assert data["returned_for_next_task_count"] == 1
    assert data["trip_cycle_retention_rate"] == 0.50
