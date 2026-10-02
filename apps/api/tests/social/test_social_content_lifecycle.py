from __future__ import annotations

from datetime import datetime, timezone
import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.events.models import OutboxEvent
from app.modules.social.domain.enums import ContentType, CulturalSensitivityLevel


def test_create_social_content_draft_with_tourism_links(
    client: TestClient,
    db_session: Session,
    auth_headers: dict[str, str],
):
    # Register creator first
    client.post(
        "/api/social/creators/register",
        json={"handle": "bastar_shutterbug", "display_name": "Bastar Shutterbug", "district_id": "bastar"},
        headers=auth_headers,
    )

    payload = {
        "content_type": "REEL",
        "title": "Monsoon Roar of Chitrakote Falls",
        "caption": "India's Niagara at peak monsoon swell. The Indravati river at its most majestic.",
        "district_id": "bastar",
        "place_slug": "chitrakote-waterfall",
        "festival_name": "Bastar Dussehra",
        "cultural_tags": ["Indravati", "Monsoon", "Nature"],
        "tourism_tags": ["Waterfalls", "EcoTourism"],
        "media_items": [
            {
                "media_type": "VIDEO",
                "media_url": "https://cdn.unseen36garh.in/reels/chitrakote_monsoon.mp4",
                "thumbnail_url": "https://cdn.unseen36garh.in/reels/chitrakote_thumb.jpg",
                "duration_seconds": 28.5,
                "aspect_ratio": "9:16",
                "resolution": "1080x1920",
                "language": "hi",
            }
        ],
    }

    res = client.post("/api/social/content/?auto_submit=true", json=payload, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Monsoon Roar of Chitrakote Falls"
    assert data["content_type"] == "REEL"
    assert data["place_slug"] == "chitrakote-waterfall"
    assert data["district_id"] == "bastar"
    assert data["festival_name"] == "Bastar Dussehra"
    assert len(data["media_items"]) == 1
    assert data["media_items"][0]["duration_seconds"] == 28.5
    assert data["publication_status"] == "SUBMITTED"

    # Outbox event emitted
    outbox = db_session.query(OutboxEvent).filter(OutboxEvent.event_type == "SOCIAL_CONTENT_CREATED").first()
    assert outbox is not None
    assert outbox.payload["place_slug"] == "chitrakote-waterfall"


def test_ephemeral_story_lifecycle_and_evergreen(
    client: TestClient,
    db_session: Session,
    auth_headers: dict[str, str],
    admin_headers: dict[str, str],
):
    # Register creator
    client.post(
        "/api/social/creators/register",
        json={"handle": "jagdalpur_live", "display_name": "Jagdalpur Live", "district_id": "bastar"},
        headers=auth_headers,
    )

    story_payload = {
        "content_type": "STORY",
        "title": "Bastar Dussehra Chariot Pulling Today",
        "caption": "Live preparation at Sirhasar Bhavan.",
        "district_id": "bastar",
        "festival_name": "Bastar Dussehra",
        "media_items": [
            {
                "media_type": "IMAGE",
                "media_url": "https://cdn.unseen36garh.in/stories/dussehra_ratha.jpg",
                "aspect_ratio": "9:16",
            }
        ],
    }

    create_res = client.post("/api/social/content/?auto_submit=true", json=story_payload, headers=auth_headers)
    assert create_res.status_code == 201
    content_id = create_res.json()["id"]

    # Approve and publish story
    review_res = client.post(
        f"/api/social/admin/moderation/{content_id}/review?auto_publish_on_approve=true",
        json={"decision": "APPROVE", "reason": "Timely high-value festival story."},
        headers=admin_headers,
    )
    assert review_res.status_code == 200
    published_story = review_res.json()
    assert published_story["publication_status"] == "PUBLISHED"
    assert published_story["expires_at"] is not None  # Has 24h expiration

    # Now convert this story into permanent evergreen cultural archive!
    evergreen_res = client.post(f"/api/social/admin/moderation/{content_id}/evergreen", headers=admin_headers)
    assert evergreen_res.status_code == 200
    evergreen_data = evergreen_res.json()
    assert evergreen_data["is_evergreen"] is True
    assert evergreen_data["expires_at"] is None
