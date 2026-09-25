from __future__ import annotations

import pytest


def test_list_and_seed_default_jtbds(client, researcher_headers):
    response = client.get("/api/v1/market-validation/jobs", headers=researcher_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 6
    keys = [item["jtbd_key"] for item in data["items"]]
    assert "JTBD-1" in keys
    assert "JTBD-3" in keys
    assert "JTBD-6" in keys


def test_update_jtbd_metrics(client, researcher_headers):
    # Fetch JTBD-3
    res = client.get("/api/v1/market-validation/jobs", headers=researcher_headers)
    jtbd_3 = next(j for j in res.json()["items"] if j["jtbd_key"] == "JTBD-3")

    update_res = client.patch(
        f"/api/v1/market-validation/jobs/{jtbd_3['id']}",
        json={
            "total_interviews_evaluated": 20,
            "supporting_interviews_count": 16,
            "direct_behavior_count": 8,
            "observed_workaround_count": 4,
            "status": "SUPPORTED",
            "evidence_summary": "16 out of 20 participants struggled with multi-stop Bastar trip planning.",
        },
        headers=researcher_headers,
    )
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["status"] == "SUPPORTED"
    assert data["confidence_score"] > 0
