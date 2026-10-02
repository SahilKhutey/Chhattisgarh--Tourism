from __future__ import annotations

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.modules.social.domain.enums import CulturalSensitivityLevel


def test_sacred_ritual_requires_consent_and_attribution(
    client: TestClient,
    auth_headers: dict[str, str],
):
    client.post(
        "/api/social/creators/register",
        json={"handle": "tribal_ethnographer", "display_name": "Tribal Ethnographer", "district_id": "bastar"},
        headers=auth_headers,
    )

    # Attempt to post SACRED_RITUAL without consent -> 422 CULTURAL_CONSENT_VIOLATION
    bad_payload = {
        "title": "Secret Rituals of Bastar Forest Shrine",
        "district_id": "bastar",
        "cultural_sensitivity": "SACRED_RITUAL",
        "has_sacred_consent": False,
    }
    res = client.post("/api/social/content/", json=bad_payload, headers=auth_headers)
    assert res.status_code == 422
    err_msg1 = res.json().get("detail") or res.json().get("error", {}).get("message", "")
    assert "verified community/elder consent" in err_msg1

    # Attempt to post SACRED_RITUAL with consent but missing community attribution -> 422
    bad_payload2 = {
        "title": "Secret Rituals of Bastar Forest Shrine",
        "district_id": "bastar",
        "cultural_sensitivity": "SACRED_RITUAL",
        "has_sacred_consent": True,
        "community_attribution": "",
    }
    res2 = client.post("/api/social/content/", json=bad_payload2, headers=auth_headers)
    assert res2.status_code == 422
    err_msg2 = res2.json().get("detail") or res2.json().get("error", {}).get("message", "")
    assert "community attribution" in err_msg2

    # Valid sacred ritual submission with elder council attribution
    valid_payload = {
        "title": "Sacred Devgudi Cleansing Ceremony",
        "district_id": "bastar",
        "cultural_sensitivity": "SACRED_RITUAL",
        "has_sacred_consent": True,
        "community_attribution": "Authorized by Kondagaon Muria Tribal Council",
    }
    valid_res = client.post("/api/social/content/", json=valid_payload, headers=auth_headers)
    assert valid_res.status_code == 201
    assert valid_res.json()["has_sacred_consent"] is True
    assert valid_res.json()["community_attribution"] == "Authorized by Kondagaon Muria Tribal Council"


def test_moderation_queue_and_actions(
    client: TestClient,
    auth_headers: dict[str, str],
    admin_headers: dict[str, str],
):
    client.post(
        "/api/social/creators/register",
        json={"handle": "sirpur_historian", "display_name": "Sirpur Historian", "district_id": "mahasamund"},
        headers=auth_headers,
    )

    create_res = client.post(
        "/api/social/content/?auto_submit=true",
        json={
            "title": "Uncovering Ancient Brick Temples of Sirpur",
            "district_id": "mahasamund",
            "place_slug": "sirpur-heritage-site",
        },
        headers=auth_headers,
    )
    content_id = create_res.json()["id"]

    # Check moderation queue
    queue_res = client.get("/api/social/admin/moderation/queue", headers=admin_headers)
    assert queue_res.status_code == 200
    queue_items = queue_res.json()
    assert any(q["content_id"] == content_id for q in queue_items)

    # Reject content
    reject_res = client.post(
        f"/api/social/admin/moderation/{content_id}/review",
        json={"decision": "REJECT", "reason": "Requires higher resolution historical photos."},
        headers=admin_headers,
    )
    assert reject_res.status_code == 200
    assert reject_res.json()["moderation_status"] == "REJECTED"
    assert reject_res.json()["publication_status"] == "REJECTED"
