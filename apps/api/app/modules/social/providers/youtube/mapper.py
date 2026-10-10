from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from app.modules.social.context.resolver import SocialContextResolver
from app.modules.social.domain.enums import (
    ContentStatus,
    ContentType,
    ContentVisibility,
    SocialContentStatus,
    SocialPlatform,
)
from app.modules.social.models.social_content import SocialContent
from app.modules.social.providers.youtube.classifier import YouTubeContentClassifier
from app.modules.social.providers.youtube.parser import duration_to_seconds, youtube_video_url


class YouTubeContentMapper:
    """Maps raw YouTube video API payloads into canonical SocialContent models."""

    def __init__(self, classifier: YouTubeContentClassifier | None = None) -> None:
        self.classifier = classifier or YouTubeContentClassifier()

    def _extract_best_thumbnail(self, thumbnails: dict[str, Any]) -> str | None:
        if not thumbnails:
            return None
        # Preferred order: maxres -> standard -> high -> medium -> default
        for key in ("maxres", "standard", "high", "medium", "default"):
            t = thumbnails.get(key)
            if t and isinstance(t, dict) and t.get("url"):
                return t["url"]
        return None

    def _parse_published_at(self, value: str | None) -> datetime | None:
        if not value:
            return None
        try:
            # Format: 2026-10-03T10:15:30Z
            clean = value.replace("Z", "+00:00")
            return datetime.fromisoformat(clean)
        except Exception:
            return datetime.now(timezone.utc)

    def map_video(
        self,
        video: dict[str, Any],
        *,
        creator_id: uuid.UUID,
        social_account_id: uuid.UUID,
        creator_district_id: str | None = "bastar",
    ) -> SocialContent:
        video_id = video.get("id")
        if not video_id:
            raise ValueError("YouTube video payload is missing 'id'.")

        snippet = video.get("snippet", {})
        details = video.get("contentDetails", {})
        status = video.get("status", {})
        stats = video.get("statistics", {})

        title = snippet.get("title", "")
        description = snippet.get("description", "")
        published_at = self._parse_published_at(snippet.get("publishedAt"))
        thumbnail_url = self._extract_best_thumbnail(snippet.get("thumbnails", {}))
        source_url = youtube_video_url(video_id)

        duration_iso = details.get("duration", "PT0S")
        duration_seconds = duration_to_seconds(duration_iso)
        aspect_ratio = "9:16" if duration_seconds <= 180 else "16:9"

        # Content classification (Short vs Video)
        content_type = self.classifier.classify_domain(
            duration_seconds=duration_seconds,
            title=title,
            description=description,
            source_url=source_url,
            tags=snippet.get("tags"),
        )

        # Visibility and publication status policies
        privacy_status = (status.get("privacyStatus") or "public").lower()
        upload_status = (status.get("uploadStatus") or "processed").lower()

        source_status = "active"
        if privacy_status == "private":
            visibility = ContentVisibility.PRIVATE.value
            publication_status = ContentStatus.ARCHIVED.value
            source_status = SocialContentStatus.SOURCE_PRIVATE.value
        elif upload_status == "deleted":
            visibility = ContentVisibility.PRIVATE.value
            publication_status = ContentStatus.ARCHIVED.value
            source_status = SocialContentStatus.SOURCE_DELETED.value
        elif privacy_status == "unlisted":
            visibility = ContentVisibility.UNLISTED.value
            publication_status = ContentStatus.DRAFT.value
            source_status = "unlisted"
        else:
            visibility = ContentVisibility.PUBLIC.value
            publication_status = ContentStatus.PUBLISHED.value
            source_status = "active"

        # Tourism context resolution
        resolved_context = SocialContextResolver.resolve_context(
            title=title,
            description=description,
            creator_district_id=creator_district_id,
        )

        metadata_payload = {
            "source_status": source_status,
            "privacy_status": privacy_status,
            "upload_status": upload_status,
            "duration_iso": duration_iso,
            "channel_id": snippet.get("channelId"),
            "channel_title": snippet.get("channelTitle"),
            "embeddable": status.get("embeddable", True),
            "view_count": int(stats.get("viewCount", 0)),
            "like_count": int(stats.get("likeCount", 0)),
            "comment_count": int(stats.get("commentCount", 0)),
            "tags": snippet.get("tags", []),
        }

        # Deterministic canonical slug
        slug = f"yt-{video_id.lower()}"

        return SocialContent(
            creator_id=creator_id,
            social_account_id=social_account_id,
            provider="youtube",
            provider_content_id=video_id,
            slug=slug,
            title=title,
            description=description,
            source_url=source_url,
            thumbnail_url=thumbnail_url,
            published_at=published_at,
            duration_seconds=duration_seconds,
            aspect_ratio=aspect_ratio,
            content_type=content_type.value,
            visibility=visibility,
            publication_status=publication_status,
            district_id=resolved_context.district_id or creator_district_id or "bastar",
            tourism_zone_id=resolved_context.tourism_zone_id,
            place_slug=resolved_context.place_slug,
            cultural_tags=resolved_context.cultural_tags,
            tourism_tags=resolved_context.tourism_tags,
            hashtags=resolved_context.hashtags,
            metadata_json=metadata_payload,
            likes_count=int(stats.get("likeCount", 0)),
            comments_count=int(stats.get("commentCount", 0)),
            views_count=int(stats.get("viewCount", 0)),
        )


__all__ = ["YouTubeContentMapper"]
