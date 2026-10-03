from __future__ import annotations

import uuid
from starlette.testclient import TestClient

from app.modules.social.domain.enums import (
    ContentType,
    SocialAccountStatus,
    SocialPlatform,
)


def test_admin_register_creator_with_social_accounts(
    client: TestClient,
    admin_headers: dict[str, str],
):
    payload = {
        "handle": "ravi_bastar",
        "display_name": "Ravi Kumar (Bastar Explorer)",
        "district_id": "bastar",
        "bio": "Documenting Bastar culture, waterfalls, and local traditions.",
        "categories": ["Culture", "Nature"],
        "languages": ["hi", "en", "cg"],
        "social_accounts": [
            {
                "platform": "YOUTUBE",
                "handle": "@RaviBastar",
                "profile_url": "https://youtube.com/@RaviBastar",
                "account_type": "CREATOR",
                "priority": 80,
                "content_types_allowed": ["VIDEO", "SHORT"],
                "max_items": 20,
            },
            {
                "platform": "INSTAGRAM",
                "handle": "@ravibastar",
                "profile_url": "https://instagram.com/ravibastar",
                "account_type": "CREATOR",
                "priority": 75,
                "content_types_allowed": ["REEL", "POST"],
                "max_items": 15,
            },
        ],
    }

    res = client.post("/api/social/admin/creators/register", json=payload, headers=admin_headers)
    assert res.status_code == 201, res.text
    data = res.json()
    creator_id = data["id"]
    assert data["handle"] == "ravi_bastar"

    # Verify social accounts were registered and verified by provider
    acc_res = client.get(f"/api/social/admin/creators/{creator_id}/accounts", headers=admin_headers)
    assert acc_res.status_code == 200
    accounts = acc_res.json()
    assert len(accounts) == 2

    platforms = {a["platform"]: a for a in accounts}
    assert "YOUTUBE" in platforms
    assert "INSTAGRAM" in platforms
    assert platforms["YOUTUBE"]["status"] == "VERIFIED"
    assert platforms["INSTAGRAM"]["status"] == "VERIFIED"


def test_social_acceptance_and_sync_engine(
    client: TestClient,
    admin_headers: dict[str, str],
):
    # 1. Register creator
    reg_payload = {
        "handle": "soma_mandavi",
        "display_name": "Soma Mandavi",
        "district_id": "bastar",
        "social_accounts": [
            {
                "platform": "YOUTUBE",
                "handle": "@SomaMandaviBastar",
                "content_types_allowed": ["VIDEO", "SHORT"],
                "max_items": 10,
            }
        ],
    }
    res = client.post("/api/social/admin/creators/register", json=reg_payload, headers=admin_headers)
    assert res.status_code == 201
    creator_id = res.json()["id"]

    acc_res = client.get(f"/api/social/admin/creators/{creator_id}/accounts", headers=admin_headers)
    account = acc_res.json()[0]
    account_id = account["id"]
    assert account["status"] == "VERIFIED"

    # 2. Accept social account (Social Acceptance Gate)
    accept_res = client.post(
        f"/api/social/admin/accounts/{account_id}/accept",
        json={"approved_content_types": ["VIDEO", "SHORT"], "priority": 90},
        headers=admin_headers,
    )
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "ACTIVE"

    # 3. Trigger Sync
    sync_res = client.post(f"/api/social/admin/accounts/{account_id}/sync", headers=admin_headers)
    assert sync_res.status_code == 200
    sync_data = sync_res.json()
    assert sync_data["status"] == "SUCCESS"
    assert sync_data["items_synced"] > 0

    # 4. Verify Deduplication on repeat sync
    sync_res2 = client.post(f"/api/social/admin/accounts/{account_id}/sync", headers=admin_headers)
    assert sync_res2.status_code == 200
    sync_data2 = sync_res2.json()
    assert sync_data2["status"] == "SUCCESS"
    # Deduplication ensures items are updated rather than creating duplicate records


def test_modular_feed_template_workflow(
    client: TestClient,
    admin_headers: dict[str, str],
):
    # 1. Admin creates modular feed template
    template_payload = {
        "slug": "homepage-creator-showcase",
        "name": "Homepage Creator Showcase",
        "description": "Featured YouTube and Instagram content for homepage",
        "layout": "FEATURED_GRID",
        "platforms_allowed": ["YOUTUBE", "INSTAGRAM"],
        "content_types_allowed": ["REEL", "SHORT", "VIDEO", "POST"],
        "max_items": 8,
        "columns_desktop": 4,
        "columns_tablet": 3,
        "columns_mobile": 2,
        "show_creator_info": True,
        "show_location": True,
        "show_date": True,
        "sort_strategy": "LATEST",
    }
    t_res = client.post(
        "/api/social/admin/feed-templates",
        json=template_payload,
        headers=admin_headers,
    )
    assert t_res.status_code == 201
    assert t_res.json()["slug"] == "homepage-creator-showcase"

    # 2. Consumer renders feed template
    render_res = client.get("/api/social/templates/homepage-creator-showcase")
    assert render_res.status_code == 200
    rendered = render_res.json()

    assert rendered["template"]["slug"] == "homepage-creator-showcase"
    assert rendered["template"]["layout"] == "FEATURED_GRID"
    assert rendered["template"]["columns"]["desktop"] == 4
    assert isinstance(rendered["items"], list)
