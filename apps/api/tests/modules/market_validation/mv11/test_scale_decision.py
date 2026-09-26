def test_scale_decision_all_passed_yields_scale(client, approver_headers):
    pilots = client.get("/api/v1/market-validation/pilots").json()
    pilot_id = pilots[0]["id"]

    resp = client.get(f"/api/v1/market-validation/scale-gates/{pilot_id}/decision", headers=approver_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["decision"] == "SCALE"
    assert data["passed_gates"] == 10
    assert len(data["critical_failures"]) == 0


def test_scale_decision_critical_safety_failure_yields_stop(client, operator_headers, approver_headers):
    pilots = client.get("/api/v1/market-validation/pilots").json()
    pilot_id = pilots[0]["id"]

    gates = client.get(f"/api/v1/market-validation/scale-gates/{pilot_id}").json()
    safety_gate = next(g for g in gates if g["gate_name"] == "gate_6_safety_compliance")

    # Mark safety gate as FAILED
    client.put(
        f"/api/v1/market-validation/scale-gates/gate/{safety_gate['id']}",
        json={"status": "FAILED"},
        headers=operator_headers,
    )

    resp = client.get(f"/api/v1/market-validation/scale-gates/{pilot_id}/decision", headers=approver_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["decision"] == "STOP"
    assert "safety" in data["rationale"].lower()


def test_scale_decision_economics_unproven_yields_limited_expansion(client, operator_headers, approver_headers):
    pilots = client.get("/api/v1/market-validation/pilots").json()
    pilot_id = pilots[0]["id"]

    gates = client.get(f"/api/v1/market-validation/scale-gates/{pilot_id}").json()
    # Reset safety gate to PASSED
    safety_gate = next(g for g in gates if g["gate_name"] == "gate_6_safety_compliance")
    client.put(
        f"/api/v1/market-validation/scale-gates/gate/{safety_gate['id']}",
        json={"status": "PASSED"},
        headers=operator_headers,
    )

    # Fail unit economics gate
    econ_gate = next(g for g in gates if g["gate_name"] == "gate_4_unit_economics")
    client.put(
        f"/api/v1/market-validation/scale-gates/gate/{econ_gate['id']}",
        json={"status": "FAILED"},
        headers=operator_headers,
    )

    resp = client.get(f"/api/v1/market-validation/scale-gates/{pilot_id}/decision", headers=approver_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["decision"] == "LIMITED_EXPANSION"
