def test_final_decision_endpoint(client):
    resp = client.get("/api/v1/market-validation/final")
    assert resp.status_code == 200
    data = resp.json()
    assert data["decision"] in ("GO", "CONDITIONAL_GO")
    assert data["confidence"] in ("HIGH", "VERY_HIGH")
    assert data["recommendation_scope"] is not None


def test_final_evidence_snapshot(client):
    resp = client.get("/api/v1/market-validation/final/evidence")
    assert resp.status_code == 200
    data = resp.json()
    assert data["evidence_count"] > 100
    assert data["mv11_status"] == "VALIDATED"
    assert data["mv12_status"] == "VALIDATED"
    assert data["economic_evidence"]["ltv_cac_ratio"] >= 3.0


def test_final_gates_all_mandatory_evaluated(client):
    resp = client.get("/api/v1/market-validation/final/gates")
    assert resp.status_code == 200
    gates = resp.json()
    assert len(gates) == 12
    critical_gates = [g for g in gates if g["is_critical"]]
    assert len(critical_gates) >= 9


def test_final_risks_and_contradictions(client):
    resp = client.get("/api/v1/market-validation/final/risks")
    assert resp.status_code == 200
    data = resp.json()
    assert "contradictions" in data
    assert "unknowns" in data
    assert len(data["contradictions"]) >= 1


def test_final_ninety_day_plan(client):
    resp = client.get("/api/v1/market-validation/final/90-day-plan")
    assert resp.status_code == 200
    plan = resp.json()
    assert len(plan) == 3
    assert plan[0]["phase"] == "Days 1–30"
    assert plan[1]["phase"] == "Days 31–60"
    assert plan[2]["phase"] == "Days 61–90"
