def test_scale_gates_initialization(client):
    pilots = client.get("/api/v1/market-validation/pilots").json()
    pilot_id = pilots[0]["id"]

    resp = client.get(f"/api/v1/market-validation/scale-gates/{pilot_id}")
    assert resp.status_code == 200
    gates = resp.json()
    assert len(gates) == 10
    gate_names = [g["gate_name"] for g in gates]
    assert "gate_1_consumer_demand" in gate_names
    assert "gate_6_safety_compliance" in gate_names


def test_update_scale_gate(client, operator_headers):
    pilots = client.get("/api/v1/market-validation/pilots").json()
    pilot_id = pilots[0]["id"]

    gates = client.get(f"/api/v1/market-validation/scale-gates/{pilot_id}").json()
    demand_gate = next(g for g in gates if g["gate_name"] == "gate_1_consumer_demand")

    put_resp = client.put(
        f"/api/v1/market-validation/scale-gates/gate/{demand_gate['id']}",
        json={"actual_value": 0.28, "status": "PASSED"},
        headers=operator_headers,
    )
    assert put_resp.status_code == 200
    assert put_resp.json()["actual_value"] == 0.28
