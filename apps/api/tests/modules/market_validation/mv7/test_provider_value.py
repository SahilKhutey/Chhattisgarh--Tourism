from fastapi.testclient import TestClient


def test_submit_feedback_provider_and_consumer(client: TestClient, researcher_headers: dict, test_provider):
    # Create transaction
    tx_resp = client.post(
        "/api/v1/market-validation/transactions/",
        json={
            "booking_id": "BOOK_FB_101",
            "provider_id": str(test_provider.id),
            "consumer_id": "user_fb_101",
            "gross_amount": 4000.0,
        },
        headers=researcher_headers,
    )
    tx_id = tx_resp.json()["transaction_id"]

    # Submit provider feedback
    p_fb_resp = client.post(
        f"/api/v1/market-validation/transactions/{tx_id}/feedback",
        json={
            "provider_id": str(test_provider.id),
            "feedback_type": "PROVIDER_FEEDBACK",
            "lead_quality_score": 90.0,
            "relevance_score": 85.0,
            "operational_effort_score": 20.0,
            "economic_value_score": 95.0,
            "continuation_intent": True,
            "notes": "Clear traveler requirements and timely arrival.",
        },
        headers=researcher_headers,
    )
    assert p_fb_resp.status_code == 200
    p_data = p_fb_resp.json()
    assert p_data["feedback_type"] == "PROVIDER_FEEDBACK"
    assert p_data["continuation_intent"] is True

    # Submit consumer feedback
    c_fb_resp = client.post(
        f"/api/v1/market-validation/transactions/{tx_id}/feedback",
        json={
            "provider_id": str(test_provider.id),
            "consumer_id": "user_fb_101",
            "feedback_type": "CONSUMER_FEEDBACK",
            "satisfaction_score": 96.0,
            "notes": "Fantastic cave exploration guide!",
        },
        headers=researcher_headers,
    )
    assert c_fb_resp.status_code == 200

    # Query provider value analysis
    val_resp = client.get("/api/v1/market-validation/transactions/analysis/provider-value", headers=researcher_headers)
    assert val_resp.status_code == 200
    val_data = val_resp.json()
    assert val_data["overall_provider_value_score"] > 0
    assert val_data["continuation_intent_rate"] > 0
