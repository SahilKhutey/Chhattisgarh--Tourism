import pytest


def test_record_and_summarize_willingness_to_pay(client, researcher_headers):
    # 1. Record WTP response
    payload = {
        "participant_type": "PROVIDER",
        "participant_id": "guide-surguja-01",
        "price": 25.0,
        "currency": "INR",
        "response_type": "COMMITTED",
        "committed": True,
        "payment_attempted": True,
        "purchased": True,
    }
    rec_resp = client.post("/api/v1/market-validation/business/willingness-to-pay", json=payload, headers=researcher_headers)
    assert rec_resp.status_code == 201
    assert rec_resp.json()["purchased"] is True

    # 2. Get summary
    sum_resp = client.get(
        "/api/v1/market-validation/business/willingness-to-pay/summary?participant_type=PROVIDER",
        headers=researcher_headers,
    )
    assert sum_resp.status_code == 200
    sum_data = sum_resp.json()
    assert sum_data["participant_type"] == "PROVIDER"
    assert sum_data["total_responses"] >= 1
    assert sum_data["commitment_rate"] > 0.0


def test_price_sensitivity_analysis(client, researcher_headers):
    sens_resp = client.get(
        "/api/v1/market-validation/business/willingness-to-pay/sensitivity?participant_type=PROVIDER",
        headers=researcher_headers,
    )
    assert sens_resp.status_code == 200
    sens_data = sens_resp.json()
    assert sens_data["participant_type"] == "PROVIDER"
    assert sens_data["optimal_price_point"] == 25.0
    assert sens_data["indifference_price_point"] == 20.0
