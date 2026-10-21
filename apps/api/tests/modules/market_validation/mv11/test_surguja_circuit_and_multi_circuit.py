"""
Test Suite: Surguja Ecotourism Circuit & Multi-Circuit Execution
Validates:
1. Multi-circuit topology discovery (/circuits/overview)
2. Surguja 20 certified providers (12 homestays, 8 guides) & sub-circuit filtering
3. Surguja emergency escalation roster (3 rapid responder stations)
4. Surguja launch controls (400 visitor cap, 8 open leads)
5. Operational readiness certification
"""

import pytest


def test_multi_circuit_overview_discovery(client):
    response = client.get("/api/v1/market-validation/pilots/circuits/overview")
    assert response.status_code == 200
    data = response.json()

    assert data["total_circuits"] >= 2
    circuit_ids = [c["id"] for c in data["active_circuits"]]
    assert "bastar-circuit-1" in circuit_ids
    assert "surguja-circuit-2" in circuit_ids

    # Verify Bastar Circuit 1
    bastar = next(c for c in data["active_circuits"] if c["id"] == "bastar-circuit-1")
    assert bastar["certified_providers_count"] == 18
    assert bastar["daily_visitor_cap"] == 500
    assert bastar["scale_status"] == "SCALE_VALIDATED"

    # Verify Surguja Circuit 2
    surguja = next(c for c in data["active_circuits"] if c["id"] == "surguja-circuit-2")
    assert surguja["certified_providers_count"] == 20
    assert surguja["homestays_count"] == 12
    assert surguja["guides_count"] == 8
    assert surguja["daily_visitor_cap"] == 400
    assert surguja["scale_status"] == "EXPANSION_PILOT"


def test_surguja_certified_providers_and_filtering(client):
    # Discover Surguja pilot ID
    overview = client.get("/api/v1/market-validation/pilots/circuits/overview").json()
    surguja = next(c for c in overview["active_circuits"] if c["id"] == "surguja-circuit-2")
    surguja_pilot_id = surguja["pilot_id"]

    # All providers
    resp_all = client.get(f"/api/v1/market-validation/pilots/{surguja_pilot_id}/certified-providers")
    assert resp_all.status_code == 200
    providers = resp_all.json()
    assert len(providers) == 20

    # Filter by sub-circuit: Mainpat Plateau
    resp_mainpat = client.get(
        f"/api/v1/market-validation/pilots/{surguja_pilot_id}/certified-providers?sub_circuit=Mainpat%20Plateau"
    )
    assert resp_mainpat.status_code == 200
    mainpat_provs = resp_mainpat.json()
    assert len(mainpat_provs) >= 4
    for p in mainpat_provs:
        assert p["sub_circuit"] == "Mainpat Plateau"

    # Filter by type: GUIDE
    resp_guides = client.get(
        f"/api/v1/market-validation/pilots/{surguja_pilot_id}/certified-providers?provider_type=GUIDE"
    )
    assert resp_guides.status_code == 200
    guides = resp_guides.json()
    assert len(guides) == 8
    for g in guides:
        assert g["provider_type"] == "GUIDE"
        assert g["verification_status"] == "VERIFIED"
        assert g["certification_level"] == "LEVEL_3_CERTIFIED"


def test_surguja_readiness_and_emergency_roster(client):
    overview = client.get("/api/v1/market-validation/pilots/circuits/overview").json()
    surguja = next(c for c in overview["active_circuits"] if c["id"] == "surguja-circuit-2")
    surguja_pilot_id = surguja["pilot_id"]

    resp = client.get(f"/api/v1/market-validation/pilots/{surguja_pilot_id}/circuit-readiness")
    assert resp.status_code == 200
    readiness = resp.json()

    assert readiness["destinations_count"] == 4
    dest_names = [d["name"] for d in readiness["destinations"]]
    assert any("Mainpat" in name for name in dest_names)
    assert any("Ramgarh" in name for name in dest_names)
    assert any("Tatapani" in name for name in dest_names)
    assert any("Kailash" in name for name in dest_names)

    # Emergency roster has 3 stations
    roster = readiness["emergency_roster"]
    assert len(roster) == 3
    station_names = [s["station_name"] for s in roster]
    assert any("Ambikapur" in name for name in station_names)
    assert any("Sitapur" in name for name in station_names)
    assert any("Ramanujganj" in name for name in station_names)


def test_surguja_launch_controls_thresholds(client):
    overview = client.get("/api/v1/market-validation/pilots/circuits/overview").json()
    surguja = next(c for c in overview["active_circuits"] if c["id"] == "surguja-circuit-2")
    surguja_pilot_id = surguja["pilot_id"]

    resp = client.get(f"/api/v1/market-validation/launch-controls/{surguja_pilot_id}")
    assert resp.status_code == 200
    controls = resp.json()
    assert len(controls) == 4

    traffic_ctrl = next(c for c in controls if c["control_type"] == "TRAFFIC_LIMIT")
    assert traffic_ctrl["threshold"] == 400.0

    booking_ctrl = next(c for c in controls if c["control_type"] == "BOOKING_LIMIT")
    assert booking_ctrl["threshold"] == 8.0
