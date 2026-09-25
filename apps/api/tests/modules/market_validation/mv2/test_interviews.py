from __future__ import annotations

import uuid
from datetime import datetime, timezone
import pytest


def _create_participant(client, headers):
    payload = {
        "segment": "INTERSTATE_TRAVELER",
        "traveler_type": ["SOLO_TRAVELER"],
        "origin_region": "Hyderabad",
        "age_band": "25-34",
        "travel_frequency": "FREQUENT",
        "cg_visit_history": "NEVER",
        "planning_method": "GOOGLE_SEARCH",
        "recruitment_source": "COMMUNITY",
        "consent_status": True,
    }
    res = client.post("/api/v1/market-validation/participants", json=payload, headers=headers)
    assert res.status_code == 201
    return res.json()["id"]


def test_create_interview(client, researcher_headers):
    part_id = _create_participant(client, researcher_headers)
    payload = {
        "participant_id": part_id,
        "research_project": "CG_TOURISM_MV2",
        "interviewer": "Dr. Raman",
        "date": datetime.now(timezone.utc).isoformat(),
        "duration_minutes": 45,
        "travel_context": "Bastar exploration planning",
        "destination": "Bastar",
        "transcript_status": "CONDUCTED",
        "recording_consent": True,
        "summary": "Participant struggled to find recent road conditions between Jagdalpur and Tirathgarh.",
        "key_findings": ["Fragmentation across 6 apps", "Road condition anxiety"],
    }
    response = client.post("/api/v1/market-validation/interviews", json=payload, headers=researcher_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["participant_id"] == part_id
    assert data["transcript_status"] == "CONDUCTED"
    assert data["duration_minutes"] == 45


def test_interview_requires_participant(client, researcher_headers):
    payload = {
        "participant_id": str(uuid.uuid4()),
        "research_project": "CG_TOURISM_MV2",
        "interviewer": "Dr. Raman",
        "date": datetime.now(timezone.utc).isoformat(),
        "duration_minutes": 30,
        "transcript_status": "PLANNED",
    }
    response = client.post("/api/v1/market-validation/interviews", json=payload, headers=researcher_headers)
    assert response.status_code == 404


def test_interview_state_transition(client, researcher_headers):
    part_id = _create_participant(client, researcher_headers)
    payload = {
        "participant_id": part_id,
        "research_project": "CG_TOURISM_MV2",
        "interviewer": "Dr. Raman",
        "date": datetime.now(timezone.utc).isoformat(),
        "duration_minutes": 45,
        "transcript_status": "PLANNED",
    }
    create_res = client.post("/api/v1/market-validation/interviews", json=payload, headers=researcher_headers)
    assert create_res.status_code == 201
    interview_id = create_res.json()["id"]

    # Valid progression PLANNED -> SCHEDULED -> CONDUCTED
    patch_res = client.patch(
        f"/api/v1/market-validation/interviews/{interview_id}",
        json={"transcript_status": "CONDUCTED"},
        headers=researcher_headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["transcript_status"] == "CONDUCTED"

    # Backward transition CONDUCTED -> PLANNED should fail
    backward_res = client.patch(
        f"/api/v1/market-validation/interviews/{interview_id}",
        json={"transcript_status": "PLANNED"},
        headers=researcher_headers,
    )
    assert backward_res.status_code == 400


def test_recording_requires_consent(client, researcher_headers):
    part_id = _create_participant(client, researcher_headers)
    payload = {
        "participant_id": part_id,
        "research_project": "CG_TOURISM_MV2",
        "interviewer": "Dr. Raman",
        "date": datetime.now(timezone.utc).isoformat(),
        "duration_minutes": 30,
        "transcript_status": "CONDUCTED",
        "recording_consent": False,
    }
    res = client.post("/api/v1/market-validation/interviews", json=payload, headers=researcher_headers)
    assert res.status_code == 201
    assert res.json()["recording_consent"] is False
