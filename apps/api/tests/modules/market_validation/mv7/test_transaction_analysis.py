from fastapi.testclient import TestClient


def test_transaction_analytical_endpoints(client: TestClient, researcher_headers: dict, test_provider):
    # Seed data
    client.post(
        "/api/v1/market-validation/transactions/leads",
        json={
            "provider_id": str(test_provider.id),
            "consumer_id": "c_seeded",
            "message": "Planning trip to Kanger Valley caves and falls",
        },
        headers=researcher_headers,
    )

    client.post(
        "/api/v1/market-validation/transactions/",
        json={
            "booking_id": "BOOK_SEED_10",
            "provider_id": str(test_provider.id),
            "gross_amount": 5000.0,
            "completion_status": "COMPLETED",
        },
        headers=researcher_headers,
    )

    # 1. Leads analysis
    l_resp = client.get("/api/v1/market-validation/transactions/analysis/leads", headers=researcher_headers)
    assert l_resp.status_code == 200
    assert l_resp.json()["total_leads"] >= 1

    # 2. Provider response analysis
    pr_resp = client.get("/api/v1/market-validation/transactions/analysis/provider-response", headers=researcher_headers)
    assert pr_resp.status_code == 200
    assert "sla_buckets" in pr_resp.json()

    # 3. Booking analysis
    b_resp = client.get("/api/v1/market-validation/transactions/analysis/booking", headers=researcher_headers)
    assert b_resp.status_code == 200

    # 4. Completion analysis
    c_resp = client.get("/api/v1/market-validation/transactions/analysis/completion", headers=researcher_headers)
    assert c_resp.status_code == 200
    assert c_resp.json()["completed_experiences"] >= 1

    # 5. Economic value analysis
    e_resp = client.get("/api/v1/market-validation/transactions/analysis/economic-value", headers=researcher_headers)
    assert e_resp.status_code == 200
    e_data = e_resp.json()
    assert e_data["gross_tourism_value_facilitated"] >= 5000.0
    assert e_data["estimated_local_spend"] > 0
