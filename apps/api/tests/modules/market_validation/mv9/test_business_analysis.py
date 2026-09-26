import pytest


def test_executive_business_report(client, researcher_headers):
    resp = client.get("/api/v1/market-validation/business/report", headers=researcher_headers)
    assert resp.status_code == 200
    report = resp.json()
    assert report["primary_business_model"] == "HYBRID_PROVIDER_FIRST"
    assert report["go_no_go_recommendation"] == "GO"
    assert report["sustainable_economic_value_facilitated_inr"] > 0
    assert report["blended_contribution_margin_pct"] > 70.0
    assert report["trust_risk_score"] < 0.1
    assert report["hypotheses_validated_count"] == 10

    # Ensure all guardrails pass
    guardrails = report["guardrails"]
    assert len(guardrails) >= 4
    for g in guardrails:
        assert g["is_compliant"] is True
