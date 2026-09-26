"""Full integration test for MV5 Content & Discovery Validation.

Lifecycle Flow:
Content Entry (Structured + Geo + Practical + Cultural)
  -> Trust Record Computation
  -> Content Evidence Provenance Attachment
  -> Experiment Assignment (Deterministic Control / Variant)
  -> Discovery Search & Event Tracking (Impression -> Open -> Section Open -> Save -> Trip Start)
  -> Attribution Verification & Performance Conversion Analysis
"""
from fastapi.testclient import TestClient


def test_full_content_and_discovery_validation_lifecycle(client: TestClient, researcher_headers: dict):
    # Step 1: Create canonical structured content entry
    entry_payload = {
        "content_id": "CONT_E2E_CHITRAKOTE",
        "content_type": "DESTINATION",
        "title": "Chitrakote Falls - Bastar",
        "category": "WATERFALL",
        "destination_id": "DEST_CHITRAKOTE",
        "short_description": "Horseshoe waterfall on Indravati river with dramatic monsoon flow.",
        "long_description": "Chitrakote Falls is often called the Niagara of India due to its 300m width in full monsoon.",
        "language": "en",
        "fields_json": {
            "geography": {
                "district": "Bastar",
                "latitude": 19.2017,
                "longitude": 81.7061,
                "nearby_places": ["DEST_TIRATHGARH", "DEST_KANGER_CAVE"],
                "routes": ["NH30 Corridor"],
            },
            "practical": {
                "opening_hours": "06:00 - 18:30",
                "fees": "Free entry; ₹100 boat rides",
                "best_time": "July to October",
                "duration": "3-4 hours",
                "parking": "Designated public parking",
            },
            "cultural": {
                "history": "Ancient tribal settlement dating over a millennium.",
                "local_story": "Legend of Indravati descending to bless Bastar tribes.",
                "community_context": "Local boatmen guild manages eco-friendly visitor tours.",
            },
            "trust": {
                "official_reference": "Chhattisgarh Tourism Board 2026 Audit",
            },
            "localization": {
                "hi": "चित्रकूट जलप्रपात - भारत का नियाग्रा",
                "hne": "चित्रकोट जलप्रपात - बस्तर के शान",
            },
        },
        "governance_status": "CONTENT_VERIFIED",
        "last_verified_at": "2026-09-24T00:00:00Z",
    }
    resp = client.post("/api/v1/market-validation/content/entries", json=entry_payload, headers=researcher_headers)
    assert resp.status_code == 201
    entry_data = resp.json()
    entry_db_id = entry_data["id"]
    assert entry_data["quality_score"] >= 80.0

    # Step 2: Attach Evidence Items & Verify Provenance
    ev_payload = {
        "content_entry_id": entry_db_id,
        "claim": "Boating cooperative operates sunrise and sunset tours at ₹100 per passenger.",
        "field_name": "fees",
        "source_type": "OFFICIAL",
        "source_reference": "Bastar District Administration Order 2026-44",
        "confidence": 0.98,
        "status": "VERIFIED",
    }
    ev_resp = client.post("/api/v1/market-validation/content/evidence", json=ev_payload, headers=researcher_headers)
    assert ev_resp.status_code == 201

    # Step 3: Compute Content Trust Score
    trust_resp = client.get(f"/api/v1/market-validation/content/trust/{entry_db_id}", headers=researcher_headers)
    assert trust_resp.status_code == 200
    trust_data = trust_resp.json()
    assert trust_data["trust_score"] >= 30.0

    # Step 4: Create A/B Content Experiment
    exp_payload = {
        "experiment_key": "EXP-E2E-MV5",
        "name": "Structured Content + Geo Context vs Generic Description",
        "hypothesis_key": "H-MV5-010",
        "status": "RUNNING",
        "control_version": {
            "format": "GENERIC_DESCRIPTION",
            "content_id": "CONT_E2E_CHITRAKOTE",
            "show_geo": False,
        },
        "variant_version": {
            "format": "STRUCTURED_CANONICAL",
            "content_id": "CONT_E2E_CHITRAKOTE",
            "show_geo": True,
        },
        "primary_metric": "planning_activation_rate",
        "control_metric_value": 0.14,
        "variant_metric_value": 0.35,
        "sample_size_control": 60,
        "sample_size_variant": 60,
    }
    exp_resp = client.post("/api/v1/market-validation/content/experiments", json=exp_payload, headers=researcher_headers)
    assert exp_resp.status_code == 201
    exp_id = exp_resp.json()["id"]

    # Step 5: Assign Anonymous Traveler to Experiment
    traveler_id = "anon-traveler-lifecycle-001"
    assign_resp = client.post(
        f"/api/v1/market-validation/content/experiments/{exp_id}/assign",
        json={"anonymous_user_id": traveler_id},
    )
    assert assign_resp.status_code == 200
    assigned_variant = assign_resp.json()["assigned_variant"]
    assert assigned_variant in {"CONTROL", "VARIANT"}

    # Step 6: Traveler Discovers Content via Search
    search_resp = client.post(
        "/api/v1/market-validation/content/discovery/search",
        json={"query": "Chitrakote Falls", "intent_category": "WATERFALL"},
    )
    assert search_resp.status_code == 200
    assert search_resp.json()["total"] >= 1

    # Step 7: Record Event Stream with Full Attribution
    events_to_fire = [
        ("content_impression", "SEARCH"),
        ("content_opened", "SEARCH"),
        ("practical_info_opened", "SEARCH"),
        ("destination_saved", "SEARCH"),
        ("itinerary_started", "SEARCH"),
    ]
    for ev_type, source in events_to_fire:
        ev_resp = client.post(
            "/api/v1/market-validation/content/discovery/events",
            json={
                "anonymous_user_id": traveler_id,
                "session_id": "sess-lifecycle-001",
                "event_type": ev_type,
                "discovery_source": source,
                "content_entry_id": "CONT_E2E_CHITRAKOTE",
                "destination_id": "DEST_CHITRAKOTE",
                "experiment_id": "EXP-E2E-MV5",
                "assigned_variant": assigned_variant,
            },
        )
        assert ev_resp.status_code == 201

    # Step 8: Verify Performance Attribution
    perf_resp = client.get("/api/v1/market-validation/content/analysis/performance", headers=researcher_headers)
    assert perf_resp.status_code == 200
    perf_items = perf_resp.json()
    e2e_perf = next((p for p in perf_items if p["content_entry_id"] == "CONT_E2E_CHITRAKOTE"), None)
    assert e2e_perf is not None
    assert e2e_perf["impressions"] >= 1
    assert e2e_perf["opens"] >= 1
    assert e2e_perf["saves"] >= 1
    assert e2e_perf["itinerary_starts"] >= 1
    assert e2e_perf["planning_activation_rate"] > 0.0

    # Step 9: Verify Overview & Funnel Analytics
    ov_resp = client.get("/api/v1/market-validation/content/analysis/overview", headers=researcher_headers)
    assert ov_resp.status_code == 200
    ov_data = ov_resp.json()
    assert ov_data["total_content_entries"] >= 1

    funnel_resp = client.get("/api/v1/market-validation/content/discovery/funnel", headers=researcher_headers)
    assert funnel_resp.status_code == 200
    assert len(funnel_resp.json()["funnel_steps"]) == 7
