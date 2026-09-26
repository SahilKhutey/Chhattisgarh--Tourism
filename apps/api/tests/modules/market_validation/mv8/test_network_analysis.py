from fastapi.testclient import TestClient


def test_network_gaps_and_macro_report(client: TestClient, researcher_headers: dict):
    # 1. Network gaps
    gaps_resp = client.get("/api/v1/market-validation/retention/network/gaps", headers=researcher_headers)
    assert gaps_resp.status_code == 200
    gaps = gaps_resp.json()
    assert len(gaps) >= 1
    assert "opportunity_score" in gaps[0]
    assert "recommended_action" in gaps[0]

    # 2. Filter by geography
    bastar_gaps = client.get("/api/v1/market-validation/retention/network/gaps?geography=BASTAR", headers=researcher_headers)
    assert bastar_gaps.status_code == 200
    assert all(g["geography"] == "BASTAR" for g in bastar_gaps.json())

    # 3. Macro retention report
    macro_resp = client.get("/api/v1/market-validation/retention/analysis/macro", headers=researcher_headers)
    assert macro_resp.status_code == 200
    report = macro_resp.json()
    assert report["trip_cycle_retention_rate"] > 0
    assert report["next_trip_rate"] > 0
    assert report["provider_continuation_rate"] > 0
    assert len(report["failure_causes_breakdown"]) >= 5
    assert len(report["seasonality_cohorts"]) >= 3
    assert report["retention_decision"] in ["SUPPORTED", "PARTIALLY_SUPPORTED", "INCONCLUSIVE", "INVALIDATED"]
