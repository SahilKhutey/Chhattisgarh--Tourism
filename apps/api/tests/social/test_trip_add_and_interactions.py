from __future__ import annotations

import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.events.models import OutboxEvent


def test_like_save_comment_interactions(
    client: TestClient,
    auth_headers: dict[str, str],
):
    # Register creator and create post
    client.post(
        "/api/social/creators/register",
        json={"handle": "kanger_valley_guide", "display_name": "Kanger Guide", "district_id": "bastar"},
        headers=auth_headers,
    )
    post = client.post(
        "/api/social/content/",
        json={"title": "Kotumsar Cave Limestone Formations", "district_id": "bastar", "place_slug": "kotumsar-cave"},
        headers=auth_headers,
    ).json()
    content_id = post["id"]

    # 1. Like toggle
    like1 = client.post(f"/api/social/interactions/{content_id}/like", headers=auth_headers).json()
    assert like1["liked"] is True
    assert like1["likes_count"] == 1

    like2 = client.post(f"/api/social/interactions/{content_id}/like", headers=auth_headers).json()
    assert like2["liked"] is False
    assert like2["likes_count"] == 0

    # 2. Save toggle
    save1 = client.post(f"/api/social/interactions/{content_id}/save?collection=Caving", headers=auth_headers).json()
    assert save1["saved"] is True
    assert save1["saves_count"] == 1

    # 3. Comment
    comment = client.post(
        f"/api/social/interactions/{content_id}/comment",
        json={"comment_text": "Is guide mandatory for entering Kotumsar Cave?"},
        headers=auth_headers,
    )
    assert comment.status_code == 201
    assert comment.json()["comment_text"] == "Is guide mandatory for entering Kotumsar Cave?"


def test_add_to_trip_planner_integration(
    client: TestClient,
    db_session: Session,
    auth_headers: dict[str, str],
):
    # Register creator
    client.post(
        "/api/social/creators/register",
        json={"handle": "tirathgarh_adventures", "display_name": "Tirathgarh Adventures", "district_id": "bastar"},
        headers=auth_headers,
    )
    post = client.post(
        "/api/social/content/",
        json={
            "title": "Cascading Falls of Tirathgarh",
            "district_id": "bastar",
            "place_slug": "tirathgarh-waterfall",
            "route_id": "bastar-waterfall-corridor",
        },
        headers=auth_headers,
    ).json()
    content_id = post["id"]

    # Traveler clicks "Add to Trip" on the reel/post
    trip_payload = {
        "trip_id": "trip-bastar-winter-2026",
        "place_slug": "tirathgarh-waterfall",
    }
    trip_add_res = client.post(
        f"/api/social/interactions/{content_id}/trip-add",
        json=trip_payload,
        headers=auth_headers,
    )
    assert trip_add_res.status_code == 200
    data = trip_add_res.json()
    assert data["success"] is True
    assert data["trip_adds_count"] == 1
    assert data["place_slug"] == "tirathgarh-waterfall"

    # Verify that the Outbox recorded the high-value SOCIAL_INTERACTION_TRIP_ADD event
    outbox = (
        db_session.query(OutboxEvent)
        .filter(OutboxEvent.event_type == "SOCIAL_INTERACTION_TRIP_ADD")
        .first()
    )
    assert outbox is not None
    assert outbox.payload["place_slug"] == "tirathgarh-waterfall"
    assert outbox.payload["trip_id"] == "trip-bastar-winter-2026"
    assert outbox.payload["district_id"] == "bastar"
