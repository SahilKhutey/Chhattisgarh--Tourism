from __future__ import annotations

import pytest


def test_create_problem(client, researcher_headers):
    payload = {
        "journey_stage": "PLANNING",
        "problem_statement": "Cannot determine which attractions can realistically be combined into a one-day route in Bastar.",
        "current_behavior": "Open Google Maps and add multiple pins, but road travel times are unreliable.",
        "workaround": "Ask local hotel manager or WhatsApp group.",
        "frequency": 5,
        "severity": 4,
        "emotional_cost": 4,
        "financial_cost": 2,
        "time_cost": 4,
        "trust_impact": 4,
        "evidence_strength": "DIRECT_BEHAVIOR",
        "affected_segment": "INTERSTATE_TRAVELER",
        "affected_geography": "Bastar",
        "related_jtbd": "JTBD-3",
        "cluster_tag": "REGIONAL_DISCOVERY_CONTEXT",
        "status": "SUPPORTED",
    }
    response = client.post("/api/v1/market-validation/problems", json=payload, headers=researcher_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["journey_stage"] == "PLANNING"
    # Pain score = 5 * 4 * 4 * 4 = 320
    assert data["pain_score"] == 320
    assert data["cluster_tag"] == "REGIONAL_DISCOVERY_CONTEXT"


def test_problem_requires_journey_stage(client, researcher_headers):
    payload = {
        "journey_stage": "NON_EXISTENT_STAGE",
        "problem_statement": "Invalid stage test",
        "current_behavior": "Test",
        "workaround": "Test",
    }
    response = client.post("/api/v1/market-validation/problems", json=payload, headers=researcher_headers)
    assert response.status_code in (422, 400)


def test_problem_score(client, researcher_headers):
    payload = {
        "journey_stage": "EVALUATION",
        "problem_statement": "Waterfall photos online don't mention dry season status.",
        "current_behavior": "Look at Google Reviews dates.",
        "workaround": "Call local DFO or forest resthouse.",
        "frequency": 4,
        "severity": 5,
        "time_cost": 3,
        "trust_impact": 5,
        "evidence_strength": "REPORTED_PAIN",
    }
    response = client.post("/api/v1/market-validation/problems", json=payload, headers=researcher_headers)
    assert response.status_code == 201
    # 4 * 5 * 3 * 5 = 300
    assert response.json()["pain_score"] == 300


def test_problem_cluster(client, researcher_headers):
    payload = {
        "journey_stage": "DISCOVERY",
        "problem_statement": "Don't know about lesser-known caves beyond Kotumsar.",
        "current_behavior": "Browse Instagram reels.",
        "workaround": "None, miss out on offbeat spots.",
        "frequency": 4,
        "severity": 3,
        "time_cost": 2,
        "trust_impact": 3,
        # Omit cluster_tag to test automatic taxonomy clustering
    }
    response = client.post("/api/v1/market-validation/problems", json=payload, headers=researcher_headers)
    assert response.status_code == 201
    assert response.json()["cluster_tag"] == "DESTINATION_DISCOVERY"
