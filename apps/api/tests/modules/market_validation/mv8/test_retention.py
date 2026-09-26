import pytest
from fastapi.testclient import TestClient


def test_record_meaningful_action_lifecycle(client: TestClient, researcher_headers: dict):
    user_id = "anon-traveler-001"

    # 1. First action: Destination discovery
    resp1 = client.post(
        "/api/v1/market-validation/retention/action",
        json={
            "anonymous_user_id": user_id,
            "action_type": "DESTINATION_DISCOVERY",
            "destination_id": "bastar-chitrakote",
        },
        headers=researcher_headers,
    )
    assert resp1.status_code == 201
    data1 = resp1.json()
    assert data1["anonymous_user_id"] == user_id
    assert data1["retention_state"] == "DISCOVERED"
    assert data1["first_meaningful_action"] == "DESTINATION_DISCOVERY"
    assert "bastar-chitrakote" in data1["destinations_explored"]

    # 2. Planning action: Trip creation
    resp2 = client.post(
        "/api/v1/market-validation/retention/action",
        json={
            "anonymous_user_id": user_id,
            "action_type": "TRIP_CREATION",
            "destination_id": "bastar-kanger",
        },
        headers=researcher_headers,
    )
    assert resp2.status_code == 201
    data2 = resp2.json()
    assert data2["retention_state"] == "PLANNING"
    assert data2["trips_created"] == 1
    assert len(data2["destinations_explored"]) == 2

    # 3. Booking action
    resp3 = client.post(
        "/api/v1/market-validation/retention/action",
        json={
            "anonymous_user_id": user_id,
            "action_type": "BOOKING",
        },
        headers=researcher_headers,
    )
    assert resp3.status_code == 201
    assert resp3.json()["retention_state"] == "BOOKED"

    # 4. Complete trip
    resp4 = client.post(
        f"/api/v1/market-validation/retention/consumers/{user_id}/complete-trip",
        headers=researcher_headers,
    )
    assert resp4.status_code == 200
    assert resp4.json()["retention_state"] == "COMPLETED"
    assert resp4.json()["trips_completed"] == 1

    # 5. Post-trip review
    resp5 = client.post(
        "/api/v1/market-validation/retention/action",
        json={
            "anonymous_user_id": user_id,
            "action_type": "REVIEW",
        },
        headers=researcher_headers,
    )
    assert resp5.status_code == 201
    assert resp5.json()["retention_state"] == "POST_TRIP"
    assert resp5.json()["reviews_created"] == 1

    # 6. Return action: discovering new destination after completing journey
    resp6 = client.post(
        "/api/v1/market-validation/retention/action",
        json={
            "anonymous_user_id": user_id,
            "action_type": "NEW_DESTINATION_DISCOVERY",
            "destination_id": "surguja-mainpat",
        },
        headers=researcher_headers,
    )
    assert resp6.status_code == 201
    assert resp6.json()["retention_state"] == "RETURNED"
    assert resp6.json()["next_trip_started_at"] is not None


def test_invalid_action_rejected(client: TestClient, researcher_headers: dict):
    resp = client.post(
        "/api/v1/market-validation/retention/action",
        json={
            "anonymous_user_id": "user-x",
            "action_type": "INVALID_PAGE_REFRESH",
        },
        headers=researcher_headers,
    )
    assert resp.status_code == 400


def test_retention_overview(client: TestClient, researcher_headers: dict):
    # Seed action
    client.post(
        "/api/v1/market-validation/retention/action",
        json={
            "anonymous_user_id": "traveler-101",
            "action_type": "DESTINATION_DISCOVERY",
            "destination_id": "dantewada-temple",
        },
        headers=researcher_headers,
    )
    resp = client.get("/api/v1/market-validation/retention/overview", headers=researcher_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_meaningful_users"] >= 1
    assert "dantewada-temple" in data["top_destinations_explored"]
