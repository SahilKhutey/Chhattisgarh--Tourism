from fastapi.testclient import TestClient


def test_booking_intent_idempotency(client: TestClient, researcher_headers: dict, test_provider):
    idempotency_key = "idemp_key_booking_999"
    headers = {**researcher_headers, "Idempotency-Key": idempotency_key}

    payload = {
        "lead_id": "LEAD_IDEMP_001",
        "provider_id": str(test_provider.id),
        "amount_estimate": 5000.0,
    }

    # First request
    resp1 = client.post("/api/v1/market-validation/transactions/booking-intent", json=payload, headers=headers)
    assert resp1.status_code == 201
    intent1 = resp1.json()

    # Retry with same Idempotency-Key
    resp2 = client.post("/api/v1/market-validation/transactions/booking-intent", json=payload, headers=headers)
    assert resp2.status_code == 201 or resp2.status_code == 200
    intent2 = resp2.json()

    # Must return identical intent_id and record
    assert intent1["intent_id"] == intent2["intent_id"]
    assert intent1["id"] == intent2["id"]


def test_transaction_idempotency(client: TestClient, researcher_headers: dict, test_provider):
    idempotency_key = "idemp_key_txn_888"
    headers = {**researcher_headers, "Idempotency-Key": idempotency_key}

    payload = {
        "booking_id": "BOOK_IDEMP_001",
        "provider_id": str(test_provider.id),
        "gross_amount": 7500.0,
    }

    resp1 = client.post("/api/v1/market-validation/transactions/", json=payload, headers=headers)
    assert resp1.status_code == 201
    tx1 = resp1.json()

    resp2 = client.post("/api/v1/market-validation/transactions/", json=payload, headers=headers)
    assert resp2.status_code == 201 or resp2.status_code == 200
    tx2 = resp2.json()

    assert tx1["transaction_id"] == tx2["transaction_id"]
    assert tx1["id"] == tx2["id"]
