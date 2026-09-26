def test_launch_readiness_all_ready(client, operator_headers):
    # Fetch default pilot
    pilots = client.get("/api/v1/market-validation/pilots").json()
    pilot_id = pilots[0]["id"]

    check_payload = {
        "product_ready": True,
        "content_ready": True,
        "geography_ready": True,
        "supply_ready": True,
        "consumer_ready": True,
        "transaction_ready": True,
        "analytics_ready": True,
        "support_ready": True,
        "security_ready": True,
        "privacy_ready": True,
        "safety_ready": True,
        "operational_ready": True,
        "blockers": [],
    }
    resp = client.post(f"/api/v1/market-validation/readiness/{pilot_id}", json=check_payload, headers=operator_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["overall_status"] == "READY"
    assert data["passed_gates_count"] == 12
    assert data["readiness_percentage"] == 100.0


def test_launch_readiness_critical_gate_failure_blocks(client, operator_headers):
    pilots = client.get("/api/v1/market-validation/pilots").json()
    pilot_id = pilots[0]["id"]

    # Safety is not ready -> Should be blocked
    check_payload = {
        "product_ready": True,
        "content_ready": True,
        "safety_ready": False,
        "blockers": [],
    }
    resp = client.post(f"/api/v1/market-validation/readiness/{pilot_id}", json=check_payload, headers=operator_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["overall_status"] == "BLOCKED"
    assert any("Safety" in b for b in data["blockers"])
