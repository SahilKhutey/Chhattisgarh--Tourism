import pytest


def test_bastar_circuit1_seeding_and_readiness(client):
    # 1. Fetch seeded baseline pilot
    resp = client.get("/api/v1/market-validation/pilots")
    assert resp.status_code == 200
    pilots = resp.json()
    assert len(pilots) >= 1
    pilot = pilots[0]
    pilot_id = pilot["id"]
    assert "Bastar" in pilot["name"]
    assert len(pilot["destination_ids"]) == 4
    assert len(pilot["provider_ids"]) == 18

    # 2. Query circuit readiness endpoint
    readiness_resp = client.get(f"/api/v1/market-validation/pilots/{pilot_id}/circuit-readiness")
    assert readiness_resp.status_code == 200
    readiness = readiness_resp.json()

    assert readiness["pilot_id"] == pilot_id
    assert readiness["destinations_count"] == 4
    assert readiness["certified_providers_count"] == 18
    assert readiness["homestays_count"] == 10
    assert readiness["guides_count"] == 8
    assert readiness["certification_completion_pct"] == 100.0
    assert len(readiness["emergency_roster"]) >= 4
    assert readiness["emergency_status"] == "ARMED_AND_PATROLLING"
    assert readiness["founder_intervention_rate"] < 0.20
    assert readiness["is_operational_ready"] is True


def test_bastar_certified_providers_query_and_filtering(client):
    pilots = client.get("/api/v1/market-validation/pilots").json()
    pilot_id = pilots[0]["id"]

    # All providers
    resp = client.get(f"/api/v1/market-validation/pilots/{pilot_id}/certified-providers")
    assert resp.status_code == 200
    all_provs = resp.json()
    assert len(all_provs) == 18

    # Filter HOMESTAY
    resp_homestays = client.get(f"/api/v1/market-validation/pilots/{pilot_id}/certified-providers?provider_type=HOMESTAY")
    assert resp_homestays.status_code == 200
    homestays = resp_homestays.json()
    assert len(homestays) == 10
    for h in homestays:
        assert h["provider_type"] == "HOMESTAY"
        assert h["verification_status"] == "VERIFIED"
        assert h["certification_level"] == "LEVEL_3_CERTIFIED"
        assert h["response_time_sla_hours"] < 4.0
        assert h["max_lead_limit"] == 10
        assert h["safety_trained"] is True

    # Filter GUIDE
    resp_guides = client.get(f"/api/v1/market-validation/pilots/{pilot_id}/certified-providers?provider_type=GUIDE")
    assert resp_guides.status_code == 200
    guides = resp_guides.json()
    assert len(guides) == 8
    for g in guides:
        assert g["provider_type"] == "GUIDE"
        assert g["verification_status"] == "VERIFIED"
        assert g["response_time_sla_hours"] < 4.0
        assert len(g["languages"]) >= 2

    # Filter by sub-circuit
    resp_chitra = client.get(f"/api/v1/market-validation/pilots/{pilot_id}/certified-providers?sub_circuit=Chitrakote")
    assert resp_chitra.status_code == 200
    chitra = resp_chitra.json()
    assert len(chitra) >= 3
    for p in chitra:
        assert p["sub_circuit"] == "Chitrakote"


def test_circuit_breakers_evaluation_and_safety_killswitch(client, operator_headers):
    pilots = client.get("/api/v1/market-validation/pilots").json()
    pilot_id = pilots[0]["id"]

    # 1. Normal evaluation: Traffic 150 (<500), Leads 3 (<10), Failure 5% (<30%), Incidents 0 (<1)
    norm_resp = client.post(
        f"/api/v1/market-validation/launch-controls/{pilot_id}/evaluate",
        json={
            "daily_active_travelers": 150.0,
            "max_open_leads_per_host": 3.0,
            "provider_response_failure_rate": 5.0,
            "critical_safety_incidents": 0.0,
        },
        headers=operator_headers,
    )
    assert norm_resp.status_code == 200
    norm_data = norm_resp.json()
    assert norm_data["status"] == "NORMAL"
    assert norm_data["pilot_status"] == "ACTIVE"
    assert len(norm_data["actions_triggered"]) == 0

    # 2. Traffic Surge evaluation: Daily travelers = 520 (>=500 threshold)
    surge_resp = client.post(
        f"/api/v1/market-validation/launch-controls/{pilot_id}/evaluate",
        json={"daily_active_travelers": 520.0},
        headers=operator_headers,
    )
    assert surge_resp.status_code == 200
    surge_data = surge_resp.json()
    assert "THROTTLE" in surge_data["actions_triggered"]
    assert surge_data["status"] == "THROTTLED"

    # Reset traffic
    client.post(
        f"/api/v1/market-validation/launch-controls/{pilot_id}/evaluate",
        json={"daily_active_travelers": 150.0},
        headers=operator_headers,
    )

    # 3. Host Lead Overload: Host leads = 12 (>=10 threshold)
    overload_resp = client.post(
        f"/api/v1/market-validation/launch-controls/{pilot_id}/evaluate",
        json={"max_open_leads_per_host": 12.0},
        headers=operator_headers,
    )
    assert overload_resp.status_code == 200
    overload_data = overload_resp.json()
    assert "HALT_BOOKINGS" in overload_data["actions_triggered"]
    assert overload_data["status"] == "BOOKINGS_HALTED"

    # Reset leads
    client.post(
        f"/api/v1/market-validation/launch-controls/{pilot_id}/evaluate",
        json={"max_open_leads_per_host": 3.0},
        headers=operator_headers,
    )

    # 4. Critical Safety Incident Killswitch Simulation
    killswitch_resp = client.post(
        f"/api/v1/market-validation/launch-controls/{pilot_id}/simulate-incident",
        headers=operator_headers,
    )
    assert killswitch_resp.status_code == 200
    ks_data = killswitch_resp.json()
    assert "PAUSE_PILOT" in ks_data["actions_triggered"]
    assert ks_data["status"] == "PAUSED_CRITICAL_SAFETY"
    assert ks_data["pilot_status"] == "PAUSED"

    # Verify pilot entity status is officially PAUSED in database
    refreshed_pilot = client.get(f"/api/v1/market-validation/pilots/{pilot_id}").json()
    assert refreshed_pilot["status"] == "PAUSED"
