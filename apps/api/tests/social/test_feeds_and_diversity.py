from __future__ import annotations

import uuid
from fastapi.testclient import TestClient


def test_feeds_and_anti_monopoly_diversity(
    client: TestClient,
    admin_headers: dict[str, str],
):
    # Setup 3 creators in different districts
    c1_id = uuid.UUID("33333333-3333-3333-3333-333333333331")
    c2_id = uuid.UUID("33333333-3333-3333-3333-333333333332")
    c3_id = uuid.UUID("33333333-3333-3333-3333-333333333333")

    # Creator 1 (Bastar)
    client.post(
        "/api/social/creators/register",
        json={"handle": "bastar_guru", "display_name": "Bastar Guru", "district_id": "bastar"},
        headers={"X-User-ID": str(c1_id), "X-User-Role": "CREATOR"},
    )
    # Creator 2 (Surguja)
    client.post(
        "/api/social/creators/register",
        json={"handle": "mainpat_hills", "display_name": "Mainpat Hills", "district_id": "surguja"},
        headers={"X-User-ID": str(c2_id), "X-User-Role": "CREATOR"},
    )
    # Creator 3 (Raipur)
    client.post(
        "/api/social/creators/register",
        json={"handle": "raipur_insider", "display_name": "Raipur Insider", "district_id": "raipur"},
        headers={"X-User-ID": str(c3_id), "X-User-Role": "CREATOR"},
    )

    # Creator 1 creates 5 posts in Bastar
    for i in range(5):
        post = client.post(
            "/api/social/content/?auto_submit=true",
            json={
                "content_type": "POST",
                "title": f"Bastar Wonder {i}",
                "district_id": "bastar",
                "place_slug": "chitrakote-waterfall",
            },
            headers={"X-User-ID": str(c1_id), "X-User-Role": "CREATOR"},
        ).json()
        client.post(
            f"/api/social/admin/moderation/{post['id']}/review?auto_publish_on_approve=true",
            json={"decision": "APPROVE", "reason": "Approved"},
            headers=admin_headers,
        )

    # Creator 2 creates 1 post in Surguja
    post2 = client.post(
        "/api/social/content/?auto_submit=true",
        json={
            "content_type": "REEL",
            "title": "Tibetan Monasteries of Mainpat",
            "district_id": "surguja",
            "place_slug": "mainpat-monastery",
            "cultural_tags": ["Tibetan", "Buddhism"],
        },
        headers={"X-User-ID": str(c2_id), "X-User-Role": "CREATOR"},
    ).json()
    client.post(
        f"/api/social/admin/moderation/{post2['id']}/review?auto_publish_on_approve=true",
        json={"decision": "APPROVE", "reason": "Approved"},
        headers=admin_headers,
    )

    # Creator 3 creates 1 cultural story in Raipur
    post3 = client.post(
        "/api/social/content/?auto_submit=true",
        json={
            "content_type": "CULTURAL_STORY",
            "title": "Handicrafts of Ghadwa Art",
            "district_id": "raipur",
            "cultural_tags": ["Dhokra", "Ghadwa", "MetalArt"],
        },
        headers={"X-User-ID": str(c3_id), "X-User-Role": "CREATOR"},
    ).json()
    client.post(
        f"/api/social/admin/moderation/{post3['id']}/review?auto_publish_on_approve=true",
        json={"decision": "APPROVE", "reason": "Approved"},
        headers=admin_headers,
    )

    # 1. Test Home Feed with Anti-Monopoly Diversity
    home_feed = client.get("/api/social/feeds/home?limit=10").json()
    assert len(home_feed) > 0
    # Top 3 items should include Surguja and Raipur rather than only Bastar!
    top_districts = [item["district_id"] for item in home_feed[:3]]
    assert len(set(top_districts)) >= 2, "Diversity must prevent single district monopoly at top of feed"

    # 2. Test Regional Feed (Bastar only)
    bastar_feed = client.get("/api/social/feeds/regional/bastar").json()
    assert all(item["district_id"] == "bastar" for item in bastar_feed)

    # 3. Test Regional Feed (Surguja only)
    surguja_feed = client.get("/api/social/feeds/regional/surguja").json()
    assert len(surguja_feed) == 1
    assert surguja_feed[0]["place_slug"] == "mainpat-monastery"

    # 4. Test Culture Feed
    culture_feed = client.get("/api/social/feeds/culture").json()
    assert any(item["title"] == "Handicrafts of Ghadwa Art" for item in culture_feed)
