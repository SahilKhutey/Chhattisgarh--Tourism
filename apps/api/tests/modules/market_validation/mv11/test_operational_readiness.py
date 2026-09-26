def test_operational_readiness_capacity_and_founder_dependency(client, operator_headers):
    pilots = client.get("/api/v1/market-validation/pilots").json()
    pilot_id = pilots[0]["id"]

    resp = client.get(f"/api/v1/market-validation/operational-readiness/{pilot_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["readiness_status"] == "READY"
    assert data["founder_intervention_rate"] <= 0.20

    # High founder intervention triggers attention required
    update_payload = {
        "founder_dependency_metrics": {
            "total_weekly_tasks": 100,
            "founder_involved_tasks": 45,  # 45% > 20% threshold
        }
    }
    put_resp = client.put(
        f"/api/v1/market-validation/operational-readiness/{pilot_id}",
        json=update_payload,
        headers=operator_headers,
    )
    assert put_resp.status_code == 200
    updated = put_resp.json()
    assert updated["readiness_status"] == "ATTENTION_REQUIRED"
    assert updated["founder_intervention_rate"] == 0.45
