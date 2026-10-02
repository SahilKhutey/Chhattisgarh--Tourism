from __future__ import annotations

import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.events.models import OutboxEvent
from app.modules.social.models import Creator


def test_register_creator_success(client: TestClient, db_session: Session, auth_headers: dict[str, str]):
    payload = {
        "handle": "bastar_stories",
        "display_name": "Bastar Explorer",
        "bio": "Documenting tribal art and waterfalls of southern Chhattisgarh.",
        "district_id": "bastar",
        "languages": ["cg", "hi", "en"],
        "categories": ["Culture", "Waterfalls", "TribalCrafts"],
    }
    res = client.post("/api/social/creators/register", json=payload, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["handle"] == "bastar_stories"
    assert data["display_name"] == "Bastar Explorer"
    assert data["district_id"] == "bastar"
    assert data["status"] == "PENDING"
    assert data["is_verified"] is False
    assert data["followers_count"] == 0


def test_register_duplicate_handle_fails(client: TestClient, auth_headers: dict[str, str], admin_headers: dict[str, str]):
    payload = {
        "handle": "surguja_hiker",
        "display_name": "Surguja Hiker",
        "district_id": "surguja",
    }
    res1 = client.post("/api/social/creators/register", json=payload, headers=auth_headers)
    assert res1.status_code == 201

    # Attempt to register same handle with different user
    res2 = client.post("/api/social/creators/register", json=payload, headers=admin_headers)
    assert res2.status_code == 409
    err_msg = res2.json().get("detail") or res2.json().get("error", {}).get("message", "")
    assert "already registered" in err_msg


def test_get_and_update_creator_profile(client: TestClient, auth_headers: dict[str, str]):
    client.post(
        "/api/social/creators/register",
        json={"handle": "raipur_crafts", "display_name": "Raipur Crafts", "district_id": "raipur"},
        headers=auth_headers,
    )

    # Get /me
    me_res = client.get("/api/social/creators/me", headers=auth_headers)
    assert me_res.status_code == 200
    assert me_res.json()["handle"] == "raipur_crafts"

    # Update profile
    patch_res = client.patch(
        "/api/social/creators/me",
        json={"display_name": "Master Artisan of Raipur", "bio": "Bell metal and Dhokra craft collector."},
        headers=auth_headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["display_name"] == "Master Artisan of Raipur"
    assert patch_res.json()["bio"] == "Bell metal and Dhokra craft collector."

    # Get by handle
    handle_res = client.get("/api/social/creators/raipur_crafts")
    assert handle_res.status_code == 200
    assert handle_res.json()["display_name"] == "Master Artisan of Raipur"


def test_admin_verify_creator_and_outbox(
    client: TestClient,
    db_session: Session,
    auth_headers: dict[str, str],
    admin_headers: dict[str, str],
):
    reg = client.post(
        "/api/social/creators/register",
        json={"handle": "chitrakote_lens", "display_name": "Chitrakote Visuals", "district_id": "bastar"},
        headers=auth_headers,
    )
    creator_id = reg.json()["id"]

    # Verify by admin
    verify_res = client.post(f"/api/social/creators/{creator_id}/verify?is_verified=true", headers=admin_headers)
    assert verify_res.status_code == 200
    assert verify_res.json()["is_verified"] is True
    assert verify_res.json()["status"] == "VERIFIED"

    # Check that outbox recorded CREATOR_VERIFIED
    outbox_item = db_session.query(OutboxEvent).filter(OutboxEvent.event_type == "CREATOR_VERIFIED").first()
    assert outbox_item is not None
    assert outbox_item.payload["handle"] == "chitrakote_lens"


def test_follow_and_unfollow_creator(
    client: TestClient,
    auth_headers: dict[str, str],
    admin_headers: dict[str, str],
):
    # Creator 1
    reg1 = client.post(
        "/api/social/creators/register",
        json={"handle": "bastar_tribal_art", "display_name": "Bastar Art", "district_id": "bastar"},
        headers=auth_headers,
    )
    creator_id = reg1.json()["id"]

    # Creator 2 (Admin user following Creator 1)
    follow_res = client.post(f"/api/social/creators/{creator_id}/follow", headers=admin_headers)
    assert follow_res.status_code == 200
    assert follow_res.json()["following"] is True
    assert follow_res.json()["followers_count"] == 1

    # Follow again -> Unfollow
    unfollow_res = client.post(f"/api/social/creators/{creator_id}/follow", headers=admin_headers)
    assert unfollow_res.status_code == 200
    assert unfollow_res.json()["following"] is False
    assert unfollow_res.json()["followers_count"] == 0
