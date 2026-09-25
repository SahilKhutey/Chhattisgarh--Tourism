from __future__ import annotations

from datetime import datetime, timezone
import pytest


def _create_evidence_for_jtbd(client, headers, jtbd_key):
    p_res = client.post(
        "/api/v1/market-validation/participants",
        json={
            "segment": "INTERSTATE_TRAVELER",
            "traveler_type": ["SOLO_TRAVELER"],
            "origin_region": "Kolkata",
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
            "duration_minutes": 35,
            "transcript_status": "CONDUCTED",
            "recording_consent": True,
        },
        headers=headers,
    )
    interview_id = i_res.json()["id"]

    client.post(
        "/api/v1/market-validation/evidence",
        json={
            "participant_id": part_id,
            "interview_id": interview_id,
            "evidence_type": "DIRECT_BEHAVIOR",
            "observation": f"Direct observation validating {jtbd_key}.",
            "source": "RECORDING_T01",
            "researcher_confidence": 5,
            "jtbd_id": jtbd_key,
        },
        headers=headers,
    )


def test_validation_requires_evidence(client, researcher_headers):
    # Fetch JTBD-1 without any evidence attached
    res = client.get("/api/v1/market-validation/jobs", headers=researcher_headers)
    jtbd_1 = next(j for j in res.json()["items"] if j["jtbd_key"] == "JTBD-1")

    # Attempting to support JTBD-1 with 0 supporting interviews and 0 evidence records must fail
    response = client.post(
        f"/api/v1/market-validation/validation/{jtbd_1['id']}/support",
        json={
            "rationale": "I feel users like this.",
            "supporting_interviews_count": 0,
        },
        headers=researcher_headers,
    )
    assert response.status_code == 400


def test_jtbd_supported(client, researcher_headers):
    _create_evidence_for_jtbd(client, researcher_headers, "JTBD-2")

    res = client.get("/api/v1/market-validation/jobs", headers=researcher_headers)
    jtbd_2 = next(j for j in res.json()["items"] if j["jtbd_key"] == "JTBD-2")

    response = client.post(
        f"/api/v1/market-validation/validation/{jtbd_2['id']}/support",
        json={
            "rationale": "Empirical verification showed participants require verified information.",
            "supporting_interviews_count": 12,
            "direct_behavior_count": 5,
        },
        headers=researcher_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("SUPPORTED", "STRONGLY_SUPPORTED")
    assert data["supporting_interviews_count"] == 12


def test_jtbd_invalidated(client, researcher_headers):
    res = client.get("/api/v1/market-validation/jobs", headers=researcher_headers)
    jtbd_5 = next(j for j in res.json()["items"] if j["jtbd_key"] == "JTBD-5")

    response = client.post(
        f"/api/v1/market-validation/validation/{jtbd_5['id']}/invalidate",
        json={
            "rationale": "Travelers consistently reported adequate 4G connectivity at primary tourist sites.",
        },
        headers=researcher_headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == "INVALIDATED"


def test_validation_status_transition(client, researcher_headers):
    _create_evidence_for_jtbd(client, researcher_headers, "JTBD-4")
    res = client.get("/api/v1/market-validation/jobs", headers=researcher_headers)
    jtbd_4 = next(j for j in res.json()["items"] if j["jtbd_key"] == "JTBD-4")

    # Initial state UNTESTED
    assert jtbd_4["status"] == "UNTESTED"

    # Support with high counts -> STRONGLY_SUPPORTED
    support_res = client.post(
        f"/api/v1/market-validation/validation/{jtbd_4['id']}/support",
        json={
            "rationale": "Strong geographic disorientation evidence across Bastar routes.",
            "supporting_interviews_count": 15,
            "direct_behavior_count": 7,
        },
        headers=researcher_headers,
    )
    assert support_res.status_code == 200
    assert support_res.json()["status"] == "STRONGLY_SUPPORTED"
