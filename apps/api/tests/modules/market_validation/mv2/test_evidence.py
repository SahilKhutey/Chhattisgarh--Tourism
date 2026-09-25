from __future__ import annotations

import uuid
from datetime import datetime, timezone
import pytest


def _setup_interview(client, headers):
    p_res = client.post(
        "/api/v1/market-validation/participants",
        json={
            "segment": "SOLO_TRAVELER",
            "traveler_type": ["SOLO_TRAVELER"],
            "origin_region": "Pune",
            "age_band": "25-34",
            "travel_frequency": "FREQUENT",
            "cg_visit_history": "NEVER",
            "planning_method": "GOOGLE_SEARCH",
            "recruitment_source": "COMMUNITY",
            "consent_status": True,
        },
        headers=headers,
    )
    part_id = p_res.json()["id"]

    i_res = client.post(
        "/api/v1/market-validation/interviews",
        json={
            "participant_id": part_id,
            "research_project": "CG_TOURISM_MV2",
            "interviewer": "Dr. Raman",
            "date": datetime.now(timezone.utc).isoformat(),
            "duration_minutes": 40,
            "transcript_status": "CONDUCTED",
            "recording_consent": True,
        },
        headers=headers,
    )
    interview_id = i_res.json()["id"]
    return part_id, interview_id


def test_create_evidence(client, researcher_headers):
    part_id, interview_id = _setup_interview(client, researcher_headers)
    payload = {
        "participant_id": part_id,
        "interview_id": interview_id,
        "evidence_type": "DIRECT_BEHAVIOR",
        "observation": "Participant switched between 4 different browser tabs for 18 minutes without reaching a coherent route.",
        "source": "SCREEN_RECORD_TASK_03",
        "researcher_confidence": 5,
        "jtbd_id": "JTBD-3",
    }
    response = client.post("/api/v1/market-validation/evidence", json=payload, headers=researcher_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["evidence_type"] == "DIRECT_BEHAVIOR"
    assert data["source"] == "SCREEN_RECORD_TASK_03"
    assert data["jtbd_id"] == "JTBD-3"


def test_evidence_requires_source(client, researcher_headers):
    part_id, interview_id = _setup_interview(client, researcher_headers)
    payload = {
        "participant_id": part_id,
        "interview_id": interview_id,
        "evidence_type": "REPORTED_PAIN",
        "observation": "Reported that hotel phone numbers on blog were dead.",
        "source": "",  # Empty source must be rejected
    }
    response = client.post("/api/v1/market-validation/evidence", json=payload, headers=researcher_headers)
    assert response.status_code in (422, 400)


def test_evidence_type_validation(client, researcher_headers):
    part_id, interview_id = _setup_interview(client, researcher_headers)
    payload = {
        "participant_id": part_id,
        "interview_id": interview_id,
        "evidence_type": "FABRICATED_RUMOR",
        "observation": "Test",
        "source": "NOTES",
    }
    response = client.post("/api/v1/market-validation/evidence", json=payload, headers=researcher_headers)
    assert response.status_code in (422, 400)


def test_evidence_links_to_problem(client, researcher_headers):
    part_id, interview_id = _setup_interview(client, researcher_headers)
    prob_res = client.post(
        "/api/v1/market-validation/problems",
        json={
            "journey_stage": "PLANNING",
            "problem_statement": "Offline navigation failure.",
            "current_behavior": "Take screenshots.",
            "workaround": "Ask locals.",
            "frequency": 4,
            "severity": 4,
            "time_cost": 3,
            "trust_impact": 4,
            "evidence_strength": "OBSERVED_WORKAROUND",
            "related_jtbd": "JTBD-4",
        },
        headers=researcher_headers,
    )
    prob_id = prob_res.json()["id"]

    ev_res = client.post(
        "/api/v1/market-validation/evidence",
        json={
            "participant_id": part_id,
            "interview_id": interview_id,
            "problem_id": prob_id,
            "evidence_type": "OBSERVED_WORKAROUND",
            "observation": "Participant showed gallery filled with 24 screenshots of maps and handwritten notes.",
            "source": "INTERVIEW_PHOTO_ROLL_REVIEW",
            "researcher_confidence": 5,
        },
        headers=researcher_headers,
    )
    assert ev_res.status_code == 201
    assert ev_res.json()["problem_id"] == prob_id
    assert ev_res.json()["jtbd_id"] == "JTBD-4"
