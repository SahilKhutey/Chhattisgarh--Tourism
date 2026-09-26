import pytest


def test_unit_economics_overview(client, finance_admin_headers):
    resp = client.get("/api/v1/market-validation/business/unit-economics/overview", headers=finance_admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "records" in data
    assert len(data["records"]) >= 2
    assert data["is_economically_viable"] is True

    provider_record = next((r for r in data["records"] if r["segment"] == "PROVIDER"), None)
    assert provider_record is not None
    assert provider_record["ltv_cac_ratio"] >= 3.0
    assert provider_record["payback_period_months"] <= 12.0


def test_compute_custom_unit_economics(client, finance_admin_headers):
    payload = {
        "segment": "PROVIDER",
        "period": "PILOT-Q4-EXPANDED",
        "spend": 15000.0,
        "acquired_users": 50,
        "activated_users": 42,
        "paying_users": 30,
        "revenue": 21000.0,
        "variable_costs": 2100.0,
        "expected_lifespan_cycles": 12.0,
    }
    resp = client.post("/api/v1/market-validation/business/unit-economics", json=payload, headers=finance_admin_headers)
    assert resp.status_code == 201
    res_data = resp.json()
    assert res_data["cac"] == 300.0
    assert res_data["activated_cac"] == round(15000.0 / 42, 2)
    assert res_data["contribution_margin"] == round(21000.0 - 2100.0, 2)
    assert res_data["ltv"] > res_data["cac"]
