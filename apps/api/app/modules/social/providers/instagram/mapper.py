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
    LicenseType,
    SocialContentStatus,
    SocialPlatform,
)
from app.modules.social.models.social_content import SocialContent
from app.modules.social.providers.instagram.classifier import InstagramContentClassifier
from app.modules.social.providers.instagram.models import InstagramMedia


class InstagramContentMapper:
    """Maps normalized InstagramMedia objects into canonical SocialContent models."""

    def __init__(self, classifier: InstagramContentClassifier | None = None) -> None:
        self.classifier = classifier or InstagramContentClassifier()

    def _derive_title(self, media: InstagramMedia, domain_type: ContentType) -> str:
        caption = (media.caption or "").strip()
        if caption:
            # First line without leading hashtag or punctuation
            first_line = caption.split("\n")[0].strip()
            # Clean excessive hashtags from title
            cleaned = re.sub(r"#\w+", "", first_line).strip()
            if cleaned:
                return cleaned[:100].strip()
        default_label = "Instagram Reel" if domain_type == ContentType.REEL else "Instagram Post"
        return f"{default_label} by @{media.username}" if media.username else default_label

    def map(
        self,
        media: InstagramMedia,
        *,
        creator_id: uuid.UUID,
        social_account_id: uuid.UUID,
        creator_district_id: str | None = "bastar",
    ) -> SocialContent:
        if not media.provider_id:
            raise ValueError("Instagram media payload is missing 'provider_id'.")

        domain_type = self.classifier.classify_domain(
            media_type=media.media_type,
            media_product_type=media.media_product_type,
        )

        title = self._derive_title(media, domain_type)
        description = media.caption or ""
        source_url = media.permalink
        thumbnail_url = media.thumbnail_url or media.media_url
        published_at = media.timestamp or datetime.now(timezone.utc)

        # Aspect ratio policy
        if domain_type == ContentType.REEL:
            aspect_ratio = "9:16"
        elif (media.media_type or "").upper() == "VIDEO":
            aspect_ratio = "16:9"
        else:
            aspect_ratio = "1:1"

        # Carousel children count
        media_count = 1
        raw = media.raw_metadata or {}
        children = raw.get("children", {})
        if isinstance(children, dict) and "data" in children:
            media_count = len(children["data"])

        # Context resolution
        resolved_context = SocialContextResolver.resolve_context(
            title=title,
            description=description,
            creator_district_id=creator_district_id,
        )

        # Isolated metadata namespacing
        metadata_payload = {
            "source_status": "active",
            "instagram": {
                "media_type": media.media_type,
                "media_product_type": media.media_product_type,
                "username": media.username,
                "media_count": media_count,
            },
        }

        slug = f"ig-{media.provider_id.lower()}"
        attribution = f"Instagram @{media.username}" if media.username else "Instagram"

        return SocialContent(
            creator_id=creator_id,
            social_account_id=social_account_id,
            provider=SocialPlatform.INSTAGRAM.value,
            provider_content_id=media.provider_id,
            slug=slug,
            title=title,
            caption=description,
            description=description,
            source_url=source_url,
            thumbnail_url=thumbnail_url,
            published_at=published_at,
            synced_at=datetime.now(timezone.utc),
            duration_seconds=None,
            aspect_ratio=aspect_ratio,
            content_type=domain_type.value,
            visibility=ContentVisibility.PUBLIC.value,
            publication_status=ContentStatus.PUBLISHED.value,
            district_id=resolved_context.district_id or creator_district_id or "bastar",
            tourism_zone_id=resolved_context.tourism_zone_id,
            place_slug=resolved_context.place_slug,
            cultural_tags=resolved_context.cultural_tags,
            tourism_tags=resolved_context.tourism_tags,
            hashtags=resolved_context.hashtags,
            source_attribution=attribution,
            license_type=LicenseType.ORIGINAL_CREATOR.value,
            metadata_json=metadata_payload,
            likes_count=0,
            comments_count=0,
            views_count=0,
            saves_count=0,
            shares_count=0,
            trip_adds_count=0,
        )


__all__ = ["InstagramContentMapper"]
