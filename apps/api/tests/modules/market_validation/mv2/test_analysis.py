from __future__ import annotations

import pytest
from datetime import datetime, timezone


def test_complete_research_integration_workflow(client, researcher_headers):
    # Step 1: 201 Participant
    p_res = client.post(
        "/api/v1/market-validation/participants",
        json={
            "segment": "INTERSTATE_TRAVELER",
            "traveler_type": ["CULTURAL_TRAVELER", "BACKPACKER"],
            "origin_region": "Mumbai",
            "age_band": "25-34",
            "travel_frequency": "FREQUENT",
            "cg_visit_history": "NEVER",
            "planning_method": "GOOGLE_SEARCH",
            "recruitment_source": "COMMUNITY_FORUM",
            "consent_status": True,
        },
        headers=researcher_headers,
    )
    assert p_res.status_code == 201
    part_data = p_res.json()
    part_id = part_data["id"]

    # Step 2: 201 Interview
    i_res = client.post(
        "/api/v1/market-validation/interviews",
        json={
            "participant_id": part_id,
            "research_project": "CG_TOURISM_MV2",
            "interviewer": "Dr. Raman",
            "date": datetime.now(timezone.utc).isoformat(),
            "duration_minutes": 50,
            "travel_context": "Bastar Dussehra Cultural Corridor",
            "destination": "Bastar",
            "transcript_status": "CONDUCTED",
            "recording_consent": True,
            "summary": "Participant demonstrated significant difficulty finding verified homestay contacts near Jagdalpur.",
            "key_findings": ["Homestay booking friction", "Manual WhatsApp workarounds"],
        },
        headers=researcher_headers,
    )
    assert i_res.status_code == 201
    interview_data = i_res.json()
    interview_id = interview_data["id"]

    # Step 3: 201 Problem
    prob_res = client.post(
        "/api/v1/market-validation/problems",
        json={
            "participant_id": part_id,
            "interview_id": interview_id,
            "journey_stage": "BOOKING",
            "problem_statement": "Local homestays in Bastar have no online presence; only unverified phone numbers on personal travel blogs.",
            "current_behavior": "Search travel blogs for phone numbers, call 4 numbers, 3 were inactive.",
            "workaround": "Book distant chain hotel in Jagdalpur instead of experiencing tribal homestay.",
            "frequency": 5,
            "severity": 4,
            "emotional_cost": 4,
            "financial_cost": 2,
            "time_cost": 4,
            "trust_impact": 5,
            "evidence_strength": "DIRECT_BEHAVIOR",
            "affected_segment": "INTERSTATE_TRAVELER",
            "affected_geography": "Bastar",
            "related_jtbd": "JTBD-6",
            "cluster_tag": "HOMESTAY_DISCOVERY_FRICTION",
        },
        headers=researcher_headers,
    )
    assert prob_res.status_code == 201
    problem_data = prob_res.json()
    problem_id = problem_data["id"]
    # Pain score = 5 * 4 * 4 * 5 = 400
    assert problem_data["pain_score"] == 400

    # Step 4: 201 Evidence
    ev_res = client.post(
        "/api/v1/market-validation/evidence",
        json={
            "participant_id": part_id,
            "interview_id": interview_id,
            "problem_id": problem_id,
            "jtbd_id": "JTBD-6",
            "evidence_type": "DIRECT_BEHAVIOR",
            "observation": "Participant attempted to dial two phone numbers from blog during live session; both failed to connect.",
            "source": "LIVE_OBSERVATION_TASK_CALL_LOG",
            "researcher_confidence": 5,
        },
        headers=researcher_headers,
    )
    assert ev_res.status_code == 201
    ev_data = ev_res.json()
    assert ev_data["problem_id"] == problem_id
    assert ev_data["jtbd_id"] == "JTBD-6"

    # Step 5: 200 JTBD association
    jtbds_res = client.get("/api/v1/market-validation/jobs", headers=researcher_headers)
    assert jtbds_res.status_code == 200
    jtbd_6 = next(j for j in jtbds_res.json()["items"] if j["jtbd_key"] == "JTBD-6")

    # Step 6: 200 Validation
    val_res = client.post(
        f"/api/v1/market-validation/validation/{jtbd_6['id']}/support",
        json={
            "rationale": "High behavioral friction observed in authentic homestay discovery.",
            "supporting_interviews_count": 8,
            "direct_behavior_count": 4,
        },
        headers=researcher_headers,
    )
    assert val_res.status_code == 200
    assert val_res.json()["status"] in ("SUPPORTED", "STRONGLY_SUPPORTED")

    # Step 7: Record ConsumerPlanningBaseline (Task Fragmentation)
    base_res = client.post(
        "/api/v1/market-validation/analysis/baselines",
        json={
            "participant_id": part_id,
            "task_id": "TASK_BASTAR_3DAY_PLAN",
            "completion_status": "PARTIAL",
            "duration_seconds": 1320,
            "tools_used": ["Google Search", "YouTube", "Google Maps", "Instagram", "WhatsApp", "Notes"],
            "searches_count": 14,
            "manual_steps": 8,
            "unresolved_questions": ["Is Chitrakote boating open after 5 PM?", "Where to stay near Tirathgarh?"],
            "confidence_score": 2,
            "researcher_notes": "High fragmentation across 6 distinct apps. Abandoned booking attempt.",
        },
        headers=researcher_headers,
    )
    assert base_res.status_code == 201
    assert base_res.json()["workflow_fragmentation_score"] == 6

    # Step 8: Verify Dashboard Analysis Aggregations
    summary_res = client.get("/api/v1/market-validation/analysis/summary", headers=researcher_headers)
    assert summary_res.status_code == 200
    summary_data = summary_res.json()
    assert summary_data["participants_count"] >= 1
    assert summary_data["interviews_count"] >= 1
    assert summary_data["problems_count"] >= 1

    frag_res = client.get("/api/v1/market-validation/analysis/workflow-fragmentation", headers=researcher_headers)
    assert frag_res.status_code == 200
    frag_data = frag_res.json()
    assert frag_data["total_baselines"] >= 1
    assert frag_data["avg_tools_used"] == 6.0
