import pytest


def test_cohort_expansion_telemetry(client):
    pilots = client.get("/api/v1/market-validation/pilots").json()
    pilot_id = pilots[0]["id"]

    resp = client.get(f"/api/v1/market-validation/pilots/{pilot_id}/cohort-expansion")
    assert resp.status_code == 200
    data = resp.json()

    assert data["pilot_id"] == pilot_id
    assert "Days 31–60" in data["phase"]
    assert data["total_leads_achieved"] >= 150
    assert data["total_leads_achieved"] == 160

    # 3 Feeder Cohorts
    cohorts = data["feeder_cohorts"]
    assert len(cohorts) == 3
    cohort_ids = [c["id"] for c in cohorts]
    assert "cohort-raipur-urban" in cohort_ids
    assert "cohort-nagpur-eco" in cohort_ids
    assert "cohort-hyderabad-heritage" in cohort_ids

    # Monetization Economics
    econ = data["monetization"]
    assert econ["pricing_model"] == "PAY_PER_QUALIFIED_LEAD"
    assert econ["fee_per_lead_inr"] == 25.0
    assert econ["gross_revenue_inr"] == 4000.0
    assert econ["net_contribution_margin_pct"] > 90.0

    # Host Response SLA
    sla = data["host_sla"]
    assert sla["target_sla_hours"] == 4.0
    assert sla["observed_avg_sla_hours"] < 4.0
    assert sla["sla_compliance_pct"] > 90.0

    # Retention & Referral
    ret = data["retention_referral"]
    assert ret["repeat_trip_planning_intent_pct"] >= 40.0
    assert ret["gate_8_passed"] is True
    assert ret["net_promoter_score"] >= 50


def test_scale_governance_and_surguja_expansion(client):
    pilots = client.get("/api/v1/market-validation/pilots").json()
    pilot_id = pilots[0]["id"]

    # Scale Governance
    resp = client.get(f"/api/v1/market-validation/pilots/{pilot_id}/scale-governance")
    assert resp.status_code == 200
    gov = resp.json()

    assert gov["pilot_id"] == pilot_id
    assert gov["scale_decision"] == "SCALE"
    assert gov["total_gates"] == 10
    assert gov["passed_gates_count"] == 10
    assert gov["failed_gates_count"] == 0
    assert gov["authorized_for_expansion"] is True
    assert "Surguja" in gov["next_expansion_circuit"]
    assert gov["transferability_score"] >= 60.0

    # Surguja Expansion Dossier
    dossier_resp = client.get(f"/api/v1/market-validation/pilots/{pilot_id}/expansion-dossier")
    assert dossier_resp.status_code == 200
    dossier = dossier_resp.json()

    assert dossier["candidate_circuit_id"] == "surguja-ecotourism-circuit-2"
    assert "Surguja" in dossier["circuit_name"]
    assert dossier["transferability_score"] >= 70.0
    assert dossier["recommendation"] == "AUTHORIZED_FOR_SECONDARY_EXPANSION"
    assert len(dossier["key_destinations"]) == 4
    dest_ids = [d["id"] for d in dossier["key_destinations"]]
    assert "mainpat-plateau" in dest_ids
    assert "ramgarh-caves" in dest_ids
    assert "tatapani-springs" in dest_ids
