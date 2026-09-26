from fastapi.testclient import TestClient


def create_entry_for_trust(client: TestClient, headers: dict) -> str:
    resp = client.post(
        "/api/v1/market-validation/content/entries",
        json={
            "content_id": "CONT_TRUST_FIXTURE",
            "content_type": "DESTINATION",
            "title": "Kotumsar Cave Exploration",
            "category": "WILDLIFE",
            "short_description": "Subterranean limestone cave inside Kanger Valley.",
            "governance_status": "CONTENT_VERIFIED",
            "last_verified_at": "2026-09-20T10:00:00Z",
        },
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.json()["id"]


def test_trust_score_computation(client: TestClient, researcher_headers: dict):
    entry_id = create_entry_for_trust(client, researcher_headers)
    resp = client.get(f"/api/v1/market-validation/content/trust/{entry_id}", headers=researcher_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "trust_score" in data
    assert "trust_breakdown" in data
    assert data["trust_score"] >= 0.0


def test_trust_breakdown(client: TestClient, researcher_headers: dict):
    entry_id = create_entry_for_trust(client, researcher_headers)
    # Update trust with verified sources and community confirmation
    patch_resp = client.patch(
        f"/api/v1/market-validation/content/trust/{entry_id}",
        json={
            "source_count": 3,
            "verified_sources": 2,
            "freshness_score": 90.0,
            "provider_confirmation": True,
            "community_confirmation": True,
            "contradiction_count": 0,
        },
        headers=researcher_headers,
    )
    assert patch_resp.status_code == 200
    data = patch_resp.json()
    breakdown = data["trust_breakdown"]
    assert breakdown["official_source_bonus"] == 30.0
    assert breakdown["provider_confirmation_bonus"] == 15.0
    assert breakdown["community_confirmation_bonus"] == 15.0
    assert breakdown["fresh_media_bonus"] == 10.0
    assert breakdown["consistent_sources_bonus"] == 10.0
    assert data["trust_score"] >= 90.0


def test_source_verification_bonus(client: TestClient, researcher_headers: dict):
    entry_id = create_entry_for_trust(client, researcher_headers)
    # Baseline with 0 verified sources
    resp_zero = client.patch(
        f"/api/v1/market-validation/content/trust/{entry_id}",
        json={"verified_sources": 0, "source_count": 1},
        headers=researcher_headers,
    )
    assert resp_zero.status_code == 200
    score_zero = resp_zero.json()["trust_score"]

    # Add verified sources
    resp_verified = client.patch(
        f"/api/v1/market-validation/content/trust/{entry_id}",
        json={"verified_sources": 1, "source_count": 1},
        headers=researcher_headers,
    )
    assert resp_verified.status_code == 200
    score_verified = resp_verified.json()["trust_score"]
    assert score_verified == score_zero + 30.0


def test_contradiction_penalty(client: TestClient, researcher_headers: dict):
    entry_id = create_entry_for_trust(client, researcher_headers)
    # Set 0 contradictions
    resp_clean = client.patch(
        f"/api/v1/market-validation/content/trust/{entry_id}",
        json={"verified_sources": 1, "contradiction_count": 0, "freshness_score": 80.0},
        headers=researcher_headers,
    )
    clean_score = resp_clean.json()["trust_score"]

    # Introduce 2 contradictions (-30 penalty)
    resp_contra = client.patch(
        f"/api/v1/market-validation/content/trust/{entry_id}",
        json={"contradiction_count": 2},
        headers=researcher_headers,
    )
    contra_score = resp_contra.json()["trust_score"]
    assert contra_score < clean_score
    assert resp_contra.json()["trust_breakdown"]["contradiction_penalty"] == 30.0
