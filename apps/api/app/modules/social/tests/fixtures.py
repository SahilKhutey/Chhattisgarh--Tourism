from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.modules.social.domain.enums import (
    ContentType,
    CreatorStatus,
    SocialAccountStatus,
    SocialContentStatus,
    SocialPlatform,
    SocialVisibility,
)
from app.modules.social.models.context import SocialContentContext
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent


@dataclass
class SocialTestEnvironment:
    """
    Deterministic Social Test Environment Fixture Hierarchy (Section 11.5).
    """
    # Geographic hierarchy
    division_id: str
    district_id: str
    tourism_zone_id: str
    place_id: uuid.UUID
    place_slug: str
    place_name: str
    experience_id: str
    festival_name: str

    # Creators
    creator_a: Creator
    creator_b: Creator
    creator_c: Creator

    # Social Accounts
    creator_a_yt: SocialAccount
    creator_a_ig: SocialAccount
    creator_b_yt: SocialAccount
    creator_c_yt: SocialAccount

    # Canonical Content
    content_video: SocialContent
    content_short: SocialContent
    content_reel: SocialContent
    content_post: SocialContent
    content_hidden: SocialContent
    content_deleted_source: SocialContent
    content_unavailable_source: SocialContent
    content_pending_review: SocialContent
    content_published: SocialContent


def setup_social_test_environment(session: Session) -> SocialTestEnvironment:
    """
    Constructs and persists the standard deterministic test fixture hierarchy into the given session.
    """
    # 1. Geography
    division_id = "bastar_division"
    district_id = "bastar"
    tourism_zone_id = "bastar_tribal"
    place_id = uuid.uuid5(uuid.NAMESPACE_DNS, "place.chitrakote-falls")
    place_slug = "chitrakote-falls"
    place_name = "Chitrakote Falls"
    experience_id = "waterfall-trek"
    festival_name = "Bastar Dussehra"

    # 2. Creators
    creator_a = Creator(
        id=uuid.uuid5(uuid.NAMESPACE_DNS, "creator.ravi-bastar"),
        display_name="Ravi Bastar",
        handle="ravi_bastar",
        district_id=district_id,
        status=CreatorStatus.ACTIVE,
        is_verified=True,
        bio="Documenting tribal folklore, Chitrakote, and Dandami Maria culture",
    )

    creator_b = Creator(
        id=uuid.uuid5(uuid.NAMESPACE_DNS, "creator.surguja-scout"),
        display_name="Surguja Scout",
        handle="surguja_scout",
        district_id="surguja",
        status=CreatorStatus.ACTIVE,
        is_verified=True,
        bio="Northern highlands, Mainpat, and Tiger Point waterfalls",
    )

    creator_c = Creator(
        id=uuid.uuid5(uuid.NAMESPACE_DNS, "creator.rejected-creator"),
        display_name="Commercial Spammer",
        handle="commercial_spammer",
        district_id=district_id,
        status=CreatorStatus.REJECTED,
        is_verified=False,
        bio="Unverified unauthorized commercial spam account",
    )

    session.add_all([creator_a, creator_b, creator_c])
    session.flush()

    # 3. Social Accounts
    creator_a_yt = SocialAccount(
        id=uuid.uuid5(uuid.NAMESPACE_DNS, "account.ravi-bastar-yt"),
        creator_id=creator_a.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="RaviBastar",
        display_name="Ravi Bastar YouTube",
        external_account_id="UC_ravi_bastar_channel",
        status=SocialAccountStatus.ACTIVE.value,
        sync_enabled=True,
    )

    creator_a_ig = SocialAccount(
        id=uuid.uuid5(uuid.NAMESPACE_DNS, "account.ravi-bastar-ig"),
        creator_id=creator_a.id,
        platform=SocialPlatform.INSTAGRAM.value,
        handle="ravi_bastar_travels",
        display_name="Ravi Bastar Instagram",
        external_account_id="ig_ravi_bastar_id",
        status=SocialAccountStatus.ACTIVE.value,
        sync_enabled=True,
    )

    creator_b_yt = SocialAccount(
        id=uuid.uuid5(uuid.NAMESPACE_DNS, "account.surguja-scout-yt"),
        creator_id=creator_b.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="surguja_scout",
        display_name="Surguja Scout Official",
        external_account_id="UC_surguja_channel",
        status=SocialAccountStatus.ACTIVE.value,
        sync_enabled=True,
    )

    creator_c_yt = SocialAccount(
        id=uuid.uuid5(uuid.NAMESPACE_DNS, "account.commercial-spammer-yt"),
        creator_id=creator_c.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="commercial_spammer",
        display_name="Commercial Spammer",
        status=SocialAccountStatus.REJECTED.value,
        sync_enabled=False,
    )

    session.add_all([creator_a_yt, creator_a_ig, creator_b_yt, creator_c_yt])
    session.flush()

    # 4. Canonical Content Items
    now = datetime.now(timezone.utc)

    content_video = SocialContent(
        id=uuid.uuid5(uuid.NAMESPACE_DNS, "content.chitrakote-monsoon-video"),
        creator_id=creator_a.id,
        social_account_id=creator_a_yt.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_video_chitrakote_4k",
        content_type=ContentType.VIDEO.value,
        title="Monsoon Roar of Chitrakote Horseshoe Falls",
        caption="Horseshoe waterfall cascades over 90 feet into Indravati River",
        slug="monsoon-roar-of-chitrakote-horseshoe-falls",
        district_id=district_id,
        place_id=place_id,
        place_slug=place_slug,
        place_name=place_name,
        tourism_zone_id=tourism_zone_id,
        experience_id=experience_id,
        festival_name=festival_name,
        source_url="https://youtube.com/watch?v=yt_video_chitrakote_4k",
        thumbnail_url="https://images.unsplash.com/photo-1544005313?auto=format",
        duration_seconds=420,
        publication_status=SocialContentStatus.PUBLISHED.value,
        visibility=SocialVisibility.PUBLIC.value,
        published_at=now,
    )

    content_short = SocialContent(
        id=uuid.uuid5(uuid.NAMESPACE_DNS, "content.chitrakote-short"),
        creator_id=creator_a.id,
        social_account_id=creator_a_yt.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_short_chitrakote_mist",
        content_type=ContentType.SHORT.value,
        title="Mist in the Face at Chitrakote",
        caption="Standing right below the spray",
        slug="mist-in-the-face-at-chitrakote",
        district_id=district_id,
        place_id=place_id,
        place_slug=place_slug,
        place_name=place_name,
        source_url="https://youtube.com/shorts/yt_short_chitrakote_mist",
        thumbnail_url="https://images.unsplash.com/photo-1544005314?auto=format",
        duration_seconds=45,
        publication_status=SocialContentStatus.PUBLISHED.value,
        visibility=SocialVisibility.PUBLIC.value,
        published_at=now,
    )

    content_reel = SocialContent(
        id=uuid.uuid5(uuid.NAMESPACE_DNS, "content.bastar-craft-reel"),
        creator_id=creator_a.id,
        social_account_id=creator_a_ig.id,
        provider=SocialPlatform.INSTAGRAM.value,
        provider_content_id="ig_reel_dhokra_metal",
        content_type=ContentType.REEL.value,
        title="Dhokra Lost-Wax Bell Metal Casting",
        caption="Crafted by Kondagaon master artisans",
        slug="dhokra-lost-wax-bell-metal-casting",
        district_id=district_id,
        source_url="https://instagram.com/reel/ig_reel_dhokra_metal/",
        thumbnail_url="https://images.unsplash.com/photo-1544005315?auto=format",
        duration_seconds=55,
        publication_status=SocialContentStatus.PUBLISHED.value,
        visibility=SocialVisibility.PUBLIC.value,
        published_at=now,
    )

    content_post = SocialContent(
        id=uuid.uuid5(uuid.NAMESPACE_DNS, "content.bastar-post"),
        creator_id=creator_a.id,
        social_account_id=creator_a_ig.id,
        provider=SocialPlatform.INSTAGRAM.value,
        provider_content_id="ig_post_tribal_market",
        content_type=ContentType.POST.value,
        title="Colors of Jagdalpur Weekly Haat",
        caption="Organic red ant chutney and forest honey",
        slug="colors-of-jagdalpur-weekly-haat",
        district_id=district_id,
        source_url="https://instagram.com/p/ig_post_tribal_market/",
        thumbnail_url="https://images.unsplash.com/photo-1544005316?auto=format",
        publication_status=SocialContentStatus.PUBLISHED.value,
        visibility=SocialVisibility.PUBLIC.value,
        published_at=now,
    )

    content_hidden = SocialContent(
        id=uuid.uuid5(uuid.NAMESPACE_DNS, "content.hidden-curation"),
        creator_id=creator_a.id,
        social_account_id=creator_a_yt.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_video_hidden_curated",
        content_type=ContentType.VIDEO.value,
        title="Draft Story for Review",
        slug="draft-story-for-review",
        district_id=district_id,
        source_url="https://youtube.com/watch?v=yt_video_hidden_curated",
        publication_status=SocialContentStatus.PUBLISHED.value,
        visibility=SocialVisibility.HIDDEN.value,
        published_at=now,
    )

    content_deleted_source = SocialContent(
        id=uuid.uuid5(uuid.NAMESPACE_DNS, "content.deleted-source"),
        creator_id=creator_a.id,
        social_account_id=creator_a_yt.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_video_deleted_by_creator",
        content_type=ContentType.VIDEO.value,
        title="Deleted Platform Video",
        slug="deleted-platform-video",
        district_id=district_id,
        source_url="https://youtube.com/watch?v=yt_video_deleted_by_creator",
        publication_status=SocialContentStatus.SOURCE_DELETED.value,
        visibility=SocialVisibility.PUBLIC.value,
        published_at=now,
    )

    content_unavailable_source = SocialContent(
        id=uuid.uuid5(uuid.NAMESPACE_DNS, "content.unavailable-source"),
        creator_id=creator_a.id,
        social_account_id=creator_a_yt.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_video_privated",
        content_type=ContentType.VIDEO.value,
        title="Private Video from Provider",
        slug="private-video-from-provider",
        district_id=district_id,
        source_url="https://youtube.com/watch?v=yt_video_privated",
        publication_status=SocialContentStatus.SOURCE_UNAVAILABLE.value,
        visibility=SocialVisibility.PUBLIC.value,
        published_at=now,
    )

    content_pending_review = SocialContent(
        id=uuid.uuid5(uuid.NAMESPACE_DNS, "content.pending-review"),
        creator_id=creator_a.id,
        social_account_id=creator_a_yt.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_video_pending_moderation",
        content_type=ContentType.VIDEO.value,
        title="Sacred Dussehra Ritual Footage",
        slug="sacred-dussehra-ritual-footage",
        district_id=district_id,
        source_url="https://youtube.com/watch?v=yt_video_pending_moderation",
        publication_status=SocialContentStatus.UNDER_REVIEW.value,
        visibility=SocialVisibility.PUBLIC.value,
        published_at=now,
    )

    content_published = content_video

    session.add_all([
        content_video,
        content_short,
        content_reel,
        content_post,
        content_hidden,
        content_deleted_source,
        content_unavailable_source,
        content_pending_review,
    ])
    session.flush()

    return SocialTestEnvironment(
        division_id=division_id,
        district_id=district_id,
        tourism_zone_id=tourism_zone_id,
        place_id=place_id,
        place_slug=place_slug,
        place_name=place_name,
        experience_id=experience_id,
        festival_name=festival_name,
        creator_a=creator_a,
        creator_b=creator_b,
        creator_c=creator_c,
        creator_a_yt=creator_a_yt,
        creator_a_ig=creator_a_ig,
        creator_b_yt=creator_b_yt,
        creator_c_yt=creator_c_yt,
        content_video=content_video,
        content_short=content_short,
        content_reel=content_reel,
        content_post=content_post,
        content_hidden=content_hidden,
        content_deleted_source=content_deleted_source,
        content_unavailable_source=content_unavailable_source,
        content_pending_review=content_pending_review,
        content_published=content_published,
    )
