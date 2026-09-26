from fastapi.testclient import TestClient


def test_create_and_complete_transaction(client: TestClient, researcher_headers: dict, test_provider):
    payload = {
        "booking_id": "BOOK_TEST_501",
        "provider_id": str(test_provider.id),
        "consumer_id": "user_comp_501",
        "gross_amount": 3500.0,
        "currency": "INR",
        "completion_status": "SCHEDULED",
    }
    tx_resp = client.post("/api/v1/market-validation/transactions/", json=payload, headers=researcher_headers)
    assert tx_resp.status_code == 201
    tx_data = tx_resp.json()
    tx_id = tx_data["transaction_id"]
    assert tx_data["completion_status"] == "SCHEDULED"

    # Provider confirms completion
    comp_resp = client.post(
        f"/api/v1/market-validation/transactions/{tx_id}/complete",
        json={"role": "PROVIDER", "completion_status": "COMPLETED"},
        headers=researcher_headers,
    )
    assert comp_resp.status_code == 200
    comp_data = comp_resp.json()
    assert comp_data["completion_status"] == "COMPLETED"
    assert comp_data["provider_confirmed"] is True
    assert comp_data["completed_at"] is not None


def test_transaction_cancellation_reason(client: TestClient, researcher_headers: dict, test_provider):
    tx_resp = client.post(
        "/api/v1/market-validation/transactions/",
        json={
            "booking_id": "BOOK_TEST_502",
            "provider_id": str(test_provider.id),
            "gross_amount": 2000.0,
        },
        headers=researcher_headers,
    )
    tx_id = tx_resp.json()["transaction_id"]

    canc_resp = client.post(
        f"/api/v1/market-validation/transactions/{tx_id}/complete",
        json={
            "role": "CONSUMER",
            "completion_status": "CANCELLED",
            "failure_reason": "TRAVELER_CHANGED_PLAN",
        },
        headers=researcher_headers,
    )
    assert canc_resp.status_code == 200
    data = canc_resp.json()
    assert data["completion_status"] == "CANCELLED"
    assert data["failure_reason"] == "TRAVELER_CHANGED_PLAN"
