from __future__ import annotations

import uuid
from datetime import datetime, timezone
import pytest

from app.modules.social.domain.enums import (
    ContentStatus,
    ContentType,
    ContentVisibility,
    SocialContentStatus,
)
from app.modules.social.providers.youtube.mapper import YouTubeContentMapper


@pytest.fixture
def mapper():
    return YouTubeContentMapper()


def test_mapper_full_video_mapping(mapper):
    creator_id = uuid.uuid4()
    account_id = uuid.uuid4()
    raw_video = {
        "id": "Vid_Chitrakote_99",
        "snippet": {
            "title": "Chitrakote Falls - The Niagara of India in Bastar",
            "description": "Exploring the majestic Chitrakote Waterfall during the monsoon season.",
            "publishedAt": "2026-10-01T10:00:00Z",
            "channelId": "UC_CG_Tourism",
            "channelTitle": "Chhattisgarh Tourism Board",
            "tags": ["bastar", "chitrakote", "waterfall"],
            "thumbnails": {
                "default": {"url": "https://img.youtube.com/default.jpg"},
                "high": {"url": "https://img.youtube.com/high.jpg"},
                "maxres": {"url": "https://img.youtube.com/maxres.jpg"},
            },
        },
        "contentDetails": {
            "duration": "PT4M15S",
        },
        "status": {
            "privacyStatus": "public",
            "uploadStatus": "processed",
            "embeddable": True,
        },
        "statistics": {
            "viewCount": "125000",
            "likeCount": "9800",
            "commentCount": "432",
        },
    }

    content = mapper.map_video(
        raw_video,
        creator_id=creator_id,
        social_account_id=account_id,
        creator_district_id="bastar",
    )

    assert content.creator_id == creator_id
    assert content.social_account_id == account_id
    assert content.provider == "youtube"
    assert content.provider_content_id == "Vid_Chitrakote_99"
    assert content.slug == "yt-vid_chitrakote_99"
    assert content.source_url == "https://www.youtube.com/watch?v=Vid_Chitrakote_99"
    assert content.thumbnail_url == "https://img.youtube.com/maxres.jpg"
    assert content.duration_seconds == 255  # 4m 15s = 255s
    assert content.aspect_ratio == "16:9"
    assert content.content_type == ContentType.VIDEO.value
    assert content.visibility == ContentVisibility.PUBLIC.value
    assert content.publication_status == ContentStatus.PUBLISHED.value
    assert content.views_count == 125000
    assert content.likes_count == 9800
    assert content.comments_count == 432
    assert content.district_id == "bastar"
    assert "waterfalls" in content.tourism_tags


def test_mapper_short_video_mapping(mapper):
    creator_id = uuid.uuid4()
    account_id = uuid.uuid4()
    raw_video = {
        "id": "short_bastar_1",
        "snippet": {
            "title": "Bastar Dhokra Art casting in 60 seconds #shorts",
            "description": "Quick look at bell metal craft.",
            "publishedAt": "2026-10-02T15:30:00Z",
            "thumbnails": {
                "high": {"url": "https://img.youtube.com/high.jpg"},
            },
        },
        "contentDetails": {
            "duration": "PT58S",
        },
        "status": {
            "privacyStatus": "public",
        },
        "statistics": {
            "viewCount": "5000",
            "likeCount": "400",
        },
    }

    content = mapper.map_video(
        raw_video,
        creator_id=creator_id,
        social_account_id=account_id,
        creator_district_id="kondagaon",
    )

    assert content.duration_seconds == 58
    assert content.aspect_ratio == "9:16"
    assert content.content_type == ContentType.SHORT.value
    assert content.district_id == "kondagaon" or content.district_id == "bastar"


def test_mapper_private_status_mapping(mapper):
    raw_video = {
        "id": "private_vid",
        "snippet": {"title": "Secret Video", "publishedAt": "2026-10-01T10:00:00Z"},
        "status": {"privacyStatus": "private"},
    }
    content = mapper.map_video(raw_video, creator_id=uuid.uuid4(), social_account_id=uuid.uuid4())
    assert content.visibility == ContentVisibility.PRIVATE.value
    assert content.publication_status == ContentStatus.ARCHIVED.value
    assert content.metadata_json["source_status"] == SocialContentStatus.SOURCE_PRIVATE.value


def test_mapper_deleted_status_mapping(mapper):
    raw_video = {
        "id": "deleted_vid",
        "snippet": {"title": "Removed Video"},
        "status": {"privacyStatus": "public", "uploadStatus": "deleted"},
    }
    content = mapper.map_video(raw_video, creator_id=uuid.uuid4(), social_account_id=uuid.uuid4())
    assert content.visibility == ContentVisibility.PRIVATE.value
    assert content.publication_status == ContentStatus.ARCHIVED.value
    assert content.metadata_json["source_status"] == SocialContentStatus.SOURCE_DELETED.value


def test_mapper_unlisted_status_mapping(mapper):
    raw_video = {
        "id": "unlisted_vid",
        "snippet": {"title": "Unlisted Preview"},
        "status": {"privacyStatus": "unlisted"},
    }
    content = mapper.map_video(raw_video, creator_id=uuid.uuid4(), social_account_id=uuid.uuid4())
    assert content.visibility == ContentVisibility.UNLISTED.value
    assert content.publication_status == ContentStatus.DRAFT.value
    assert content.metadata_json["source_status"] == "unlisted"


def test_mapper_missing_id_raises_value_error(mapper):
    with pytest.raises(ValueError, match="missing 'id'"):
        mapper.map_video({}, creator_id=uuid.uuid4(), social_account_id=uuid.uuid4())
