from __future__ import annotations

import uuid
from datetime import datetime, timezone
import pytest

from app.modules.social.domain.enums import (
    ContentStatus,
    ContentType,
    ContentVisibility,
    LicenseType,
    SocialPlatform,
)
from app.modules.social.providers.instagram.mapper import InstagramContentMapper
from app.modules.social.providers.instagram.models import InstagramMedia


@pytest.fixture
def mapper() -> InstagramContentMapper:
    return InstagramContentMapper()


def test_map_reel_content(mapper: InstagramContentMapper):
    creator_id = uuid.uuid4()
    account_id = uuid.uuid4()
    media = InstagramMedia(
        provider_id="18023456789",
        media_type="VIDEO",
        media_product_type="REELS",
        caption="Exploring Chitrakote Falls in Bastar during Monsoon!\nCheck out this amazing view.\n#bastar #waterfall #cg_tourism",
        permalink="https://www.instagram.com/reel/Cx12345/",
        media_url="https://scontent.cdninstagram.com/v/t51.2885-15/vid1.mp4",
        thumbnail_url="https://scontent.cdninstagram.com/v/t51.2885-15/thumb1.jpg",
        timestamp=datetime(2026, 10, 5, 12, 0, 0, tzinfo=timezone.utc),
        username="bastar_travels",
    )

    content = mapper.map(
        media,
        creator_id=creator_id,
        social_account_id=account_id,
        creator_district_id="bastar",
    )

    assert content.creator_id == creator_id
    assert content.social_account_id == account_id
    assert content.provider == SocialPlatform.INSTAGRAM.value
    assert content.provider_content_id == "18023456789"
    assert content.slug == "ig-18023456789"
    assert content.source_url == "https://www.instagram.com/reel/Cx12345/"
    assert content.thumbnail_url == "https://scontent.cdninstagram.com/v/t51.2885-15/thumb1.jpg"
    assert content.content_type == ContentType.REEL.value
    assert content.aspect_ratio == "9:16"
    assert content.publication_status == ContentStatus.PUBLISHED.value
    assert content.visibility == ContentVisibility.PUBLIC.value
    assert content.license_type == LicenseType.ORIGINAL_CREATOR.value
    assert content.source_attribution == "Instagram @bastar_travels"

    # Title derived from first line with hashtags cleaned
    assert "Exploring Chitrakote Falls in Bastar during Monsoon!" in content.title

    # Context resolver tags
    assert content.district_id == "bastar"
    assert "waterfalls" in content.tourism_tags

    # Isolated metadata
    assert content.metadata_json["instagram"]["media_product_type"] == "REELS"
    assert content.metadata_json["instagram"]["username"] == "bastar_travels"
    assert content.metadata_json["instagram"]["media_count"] == 1


def test_map_carousel_album(mapper: InstagramContentMapper):
    creator_id = uuid.uuid4()
    account_id = uuid.uuid4()
    media = InstagramMedia(
        provider_id="18099999999",
        media_type="CAROUSEL_ALBUM",
        media_product_type="FEED",
        caption="Ancient Dhokra Art figures of Kondagaon craft village #dhokra #kondagaon",
        permalink="https://www.instagram.com/p/Cz98765/",
        media_url="https://scontent.cdninstagram.com/v/img1.jpg",
        thumbnail_url="https://scontent.cdninstagram.com/v/thumb1.jpg",
        timestamp=datetime(2026, 10, 6, 14, 0, 0, tzinfo=timezone.utc),
        username="cg_crafts",
        raw_metadata={
            "children": {
                "data": [
                    {"id": "18099999999_1", "media_type": "IMAGE"},
                    {"id": "18099999999_2", "media_type": "IMAGE"},
                    {"id": "18099999999_3", "media_type": "IMAGE"},
                ]
            }
        },
    )

    content = mapper.map(
        media,
        creator_id=creator_id,
        social_account_id=account_id,
        creator_district_id="kondagaon",
    )

    assert content.content_type == ContentType.POST.value
    assert content.aspect_ratio == "1:1"
    assert content.slug == "ig-18099999999"
    # A carousel must map to exactly 1 SocialContent with metadata.media_count = 3
    assert content.metadata_json["instagram"]["media_count"] == 3


def test_map_video_feed(mapper: InstagramContentMapper):
    creator_id = uuid.uuid4()
    account_id = uuid.uuid4()
    media = InstagramMedia(
        provider_id="18055555555",
        media_type="VIDEO",
        media_product_type="FEED",
        caption="Documentary glimpse of Kanger Valley National Park",
        permalink="https://www.instagram.com/p/Cw55555/",
        media_url="https://scontent.cdninstagram.com/v/vid_feed.mp4",
        thumbnail_url="https://scontent.cdninstagram.com/v/vid_feed_thumb.jpg",
        timestamp=datetime(2026, 10, 7, 9, 0, 0, tzinfo=timezone.utc),
        username="kanger_trails",
    )

    content = mapper.map(
        media,
        creator_id=creator_id,
        social_account_id=account_id,
        creator_district_id="bastar",
    )

    assert content.content_type == ContentType.VIDEO.value
    assert content.aspect_ratio == "16:9"


def test_map_fallback_title_when_caption_empty(mapper: InstagramContentMapper):
    creator_id = uuid.uuid4()
    account_id = uuid.uuid4()
    media_reel = InstagramMedia(
        provider_id="18011111111",
        media_type="VIDEO",
        media_product_type="REELS",
        caption="",
        permalink="https://www.instagram.com/reel/Cx00000/",
        username="cg_creator",
    )
    content_reel = mapper.map(media_reel, creator_id=creator_id, social_account_id=account_id)
    assert content_reel.title == "Instagram Reel by @cg_creator"

    media_post = InstagramMedia(
        provider_id="18022222222",
        media_type="IMAGE",
        media_product_type="FEED",
        caption="   #only #hashtags   ",
        permalink="https://www.instagram.com/p/Cx11111/",
        username="cg_creator",
    )
    content_post = mapper.map(media_post, creator_id=creator_id, social_account_id=account_id)
    assert content_post.title == "Instagram Post by @cg_creator"


def test_map_missing_provider_id_raises(mapper: InstagramContentMapper):
    creator_id = uuid.uuid4()
    account_id = uuid.uuid4()
    media = InstagramMedia(
        provider_id="",
        media_type="IMAGE",
        permalink="https://www.instagram.com/p/test/",
    )
    with pytest.raises(ValueError, match="missing 'provider_id'"):
        mapper.map(media, creator_id=creator_id, social_account_id=account_id)
