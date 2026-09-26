from datetime import datetime, timezone
from fastapi.testclient import TestClient


def test_create_booking_intent(client: TestClient, researcher_headers: dict, test_provider):
    payload = {
        "lead_id": "LEAD_TEST_001",
        "consumer_id": "c_intent_user",
        "provider_id": str(test_provider.id),
        "experience_id": "EXP_BASTAR_HERITAGE",
        "requested_date": datetime.now(timezone.utc).isoformat(),
        "traveler_count": 4,
        "amount_estimate": 4500.0,
        "currency": "INR",
    }
    resp = client.post("/api/v1/market-validation/transactions/booking-intent", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["intent_id"].startswith("BINT_")
    assert data["amount_estimate"] == 4500.0
    assert data["status"] == "REQUESTED"


def test_confirm_booking_intent(client: TestClient, researcher_headers: dict, test_provider):
    create_resp = client.post(
        "/api/v1/market-validation/transactions/booking-intent",
        json={
            "lead_id": "LEAD_TEST_002",
            "consumer_id": "c_intent_user_2",
            "provider_id": str(test_provider.id),
            "amount_estimate": 2500.0,
        },
        headers=researcher_headers,
    )
    intent_id = create_resp.json()["intent_id"]

    # Provider confirmation
    conf_resp = client.post(
        f"/api/v1/market-validation/transactions/booking-intent/{intent_id}/confirm",
        json={"role": "PROVIDER", "confirmed_price": 2500.0},
        headers=researcher_headers,
    )
    assert conf_resp.status_code == 200
    assert conf_resp.json()["status"] == "PROVIDER_CONFIRMED"

    # Consumer confirmation -> BOOKED
    consumer_conf = client.post(
        f"/api/v1/market-validation/transactions/booking-intent/{intent_id}/confirm",
        json={"role": "CONSUMER"},
        headers=researcher_headers,
    )
    assert consumer_conf.status_code == 200
    assert consumer_conf.json()["status"] == "BOOKED"


def test_cancel_booking_intent(client: TestClient, researcher_headers: dict, test_provider):
    create_resp = client.post(
        "/api/v1/market-validation/transactions/booking-intent",
        json={
            "lead_id": "LEAD_TEST_003",
            "provider_id": str(test_provider.id),
            "amount_estimate": 1800.0,
        },
        headers=researcher_headers,
    )
    intent_id = create_resp.json()["intent_id"]

    canc_resp = client.post(
        f"/api/v1/market-validation/transactions/booking-intent/{intent_id}/cancel",
        json={"cancellation_reason": "TRAVELER_CHANGED_PLAN", "notes": "Rescheduled for next month"},
        headers=researcher_headers,
    )
    assert canc_resp.status_code == 200
    data = canc_resp.json()
    assert data["status"] == "CANCELLED"
    assert data["intent_details"]["cancellation_reason"] == "TRAVELER_CHANGED_PLAN"
