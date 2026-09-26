import pytest


def test_pricing_catalog(client, researcher_headers):
    catalog_resp = client.get("/api/v1/market-validation/business/pricing/catalog", headers=researcher_headers)
    assert catalog_resp.status_code == 200
    data = catalog_resp.json()
    assert "lead_pricing" in data
    assert "commission_pricing" in data
    assert "subscription_pricing" in data
    assert "consumer_pricing" in data

    # Verify ₹25 verified lead is recommended
    rec_lead = next((t for t in data["lead_pricing"] if t["is_recommended"]), None)
    assert rec_lead is not None
    assert rec_lead["price"] == 25.0
    assert rec_lead["currency"] == "INR"


def test_pricing_experiment_lifecycle_and_evaluation(client, researcher_headers):
    payload = {
        "customer_type": "PROVIDER",
        "experiment_type": "LEAD_FEE",
        "control_price": 10.0,
        "variant_prices": {"B": 25.0, "C": 50.0},
        "primary_metric": "CONVERSION_RATE",
        "secondary_metrics": ["TOTAL_REVENUE", "ARPU"],
    }
    exp_resp = client.post(
        "/api/v1/market-validation/business/pricing/experiments", json=payload, headers=researcher_headers
    )
    assert exp_resp.status_code == 201
    exp_id = exp_resp.json()["id"]

    eval_resp = client.get(
        f"/api/v1/market-validation/business/pricing/experiments/{exp_id}/evaluate", headers=researcher_headers
    )
    assert eval_resp.status_code == 200
    eval_data = eval_resp.json()
    assert eval_data["experiment_id"] == exp_id
    assert eval_data["recommended_price"] == 25.0
    assert "elasticity" in eval_data
    assert "confidence_level" in eval_data
