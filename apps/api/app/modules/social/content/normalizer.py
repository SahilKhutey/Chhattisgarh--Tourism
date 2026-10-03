from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from typing import Any

from app.modules.social.context.resolver import SocialContextResolver
from app.modules.social.domain.enums import (
    ContentStatus,
    ContentType,
    ContentVisibility,
    CulturalSensitivityLevel,
    LicenseType,
    ModerationStatus,
    SocialContentType,
    SocialPlatform,
)
from app.modules.social.models.social_content import SocialContent
from app.modules.social.source.validator import SourceValidator


def _map_social_content_type(s_type: SocialContentType | ContentType | str) -> ContentType:
    val = s_type.value if hasattr(s_type, "value") else str(s_type).upper()
    if val == "VIDEO":
        return ContentType.VIDEO
    elif val == "REEL":
        return ContentType.REEL
    elif val == "SHORT":
        return ContentType.SHORT
    elif val == "STORY":
        return ContentType.STORY
    return ContentType.POST


def _platform_action_label(platform: SocialPlatform | str) -> str:
    p_val = platform.value if hasattr(platform, "value") else str(platform).lower()
    if p_val == SocialPlatform.YOUTUBE.value:
        return "Watch on YouTube"
    elif p_val == SocialPlatform.INSTAGRAM.value:
        return "View on Instagram"
    return "View Source"


class SocialContentNormalizer:
    """Normalizes raw provider content into canonical SocialContent entities."""

    @classmethod
    def normalize_provider_content(
        cls,
        item: Any,
        platform: SocialPlatform,
        creator_id: uuid.UUID,
        social_account_id: uuid.UUID,
        creator_district_id: str | None = "bastar",
    ) -> SocialContent:
        # Extract external ID flexibly from item
        content_id = str(getattr(item, "external_id", None) or getattr(item, "provider_content_id", None) or uuid.uuid4().hex)

        # 1. Validate and canonicalize source URL
        source_url = getattr(item, "source_url", "")
        validated_source = SourceValidator.validate_platform_url(source_url, platform)
        source_url = validated_source.value

        # 2. Map content type
        internal_content_type = _map_social_content_type(getattr(item, "content_type", ContentType.POST))

        # 3. Clean and title fallback
        title = (getattr(item, "title", None) or "").strip()
        desc = getattr(item, "description", None) or ""
        if not title:
            # Fallback title from description or ID
            desc_snip = desc.strip()[:50]
            title = desc_snip if desc_snip else f"Post {content_id}"

        clean_caption = desc.strip()

        # 4. Resolve tourism context
        raw_meta = getattr(item, "raw_metadata", {}) or {}
        tags = raw_meta.get("tags") if isinstance(raw_meta, dict) else None
        context = SocialContextResolver.resolve_context(
            title=title,
            description=clean_caption,
            creator_district_id=creator_district_id,
            provided_tags=tags if isinstance(tags, list) else None,
        )

        # 5. Generate deterministic slug
        clean_prefix = re.sub(r"[^a-zA-Z0-9-]", "", platform.value.lower())
        clean_id = re.sub(r"[^a-zA-Z0-9-]", "", content_id.lower())[:32]
        slug = f"{clean_prefix}-{clean_id}"

        now = datetime.now(timezone.utc)

        return SocialContent(
            creator_id=creator_id,
            social_account_id=social_account_id,
            provider=platform.value,
            provider_content_id=content_id,
            source_url=source_url,
            thumbnail_url=getattr(item, "thumbnail_url", None),
            original_platform_action_label=_platform_action_label(platform),
            content_type=internal_content_type.value,
            title=title[:250],
            caption=clean_caption,
            description=clean_caption,
            slug=slug,
            district_id=context.district_id or (creator_district_id or "bastar"),
            tourism_zone_id=context.tourism_zone_id,
            place_id=None,
            place_slug=None,
            cultural_tags=context.cultural_tags,
            tourism_tags=context.tourism_tags,
            hashtags=context.hashtags,
            language="hi",
            cultural_sensitivity=CulturalSensitivityLevel.STANDARD.value,
            license_type=LicenseType.ORIGINAL_CREATOR.value,
            source_attribution=f"Aggregated from {platform.value.capitalize()}",
            community_attribution=None,
            has_sacred_consent=False,
            visibility=ContentVisibility.PUBLIC.value,
            moderation_status=ModerationStatus.APPROVED.value,
            publication_status=ContentStatus.PUBLISHED.value,
            is_evergreen=True,
            duration_seconds=getattr(item, "duration_seconds", None),
            aspect_ratio=getattr(item, "aspect_ratio", "16:9"),
            views_count=getattr(item, "view_count", 0),
            likes_count=getattr(item, "like_count", 0),
            comments_count=getattr(item, "comment_count", 0),
            shares_count=getattr(item, "share_count", 0),
            published_at=getattr(item, "published_at", None) or now,
            synced_at=now,
            metadata_json=dict(raw_meta),
        )
