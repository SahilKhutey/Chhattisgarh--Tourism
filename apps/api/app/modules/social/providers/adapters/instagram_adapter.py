from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

from app.modules.social.domain.enums import ContentType, SocialContentType, SocialPlatform
from app.modules.social.providers.base import (
    NormalizedSocialItem,
    ProviderAccount,
    ProviderCapabilities,
    ProviderContent,
    SocialAccountProfile,
    SocialProvider,
    SyncResult,
)


class InstagramAdapter(SocialProvider):
    platform = SocialPlatform.INSTAGRAM

    def __init__(self, access_token: str | None = None) -> None:
        self.access_token = access_token

    def capabilities(self) -> ProviderCapabilities:
        return ProviderCapabilities(
            supports_posts=True,
            supports_reels=True,
            supports_shorts=False,
            supports_videos=True,
            supports_stories=True,
            supports_embeds=True,
        )

    def _extract_handle(self, handle_or_url: str) -> str:
        clean = handle_or_url.strip()
        match = re.search(r"(?:instagram\.com/)?@?([\w\-\.]+)", clean)
        if match:
            return match.group(1).lstrip("@")
        return clean.lstrip("@")

    def verify_account(self, handle_or_url: str) -> SocialAccountProfile:
        handle = self._extract_handle(handle_or_url)
        if not handle:
            return SocialAccountProfile(
                handle=handle_or_url,
                display_name=handle_or_url,
                is_valid=False,
            )

        return SocialAccountProfile(
            handle=handle,
            display_name=f"{handle.replace('_', ' ').title()}",
            profile_image_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
            bio=f"Documenting heritage, food, and secret waterfalls of Chhattisgarh. @{handle}",
            provider_channel_id=f"ig_{handle[:12]}",
            follower_or_subscriber_count=32100,
            is_valid=True,
            metadata={"platform": "INSTAGRAM", "profile_url": f"https://instagram.com/{handle}"},
        )

    def fetch_profile(self, handle: str) -> ProviderAccount:
        clean_handle = self._extract_handle(handle)
        return ProviderAccount(
            external_id=f"ig_{clean_handle[:12]}",
            handle=clean_handle,
            display_name=f"{clean_handle.replace('_', ' ').title()}",
            profile_url=f"https://instagram.com/{clean_handle}",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
            bio=f"Documenting heritage, food, and secret waterfalls of Chhattisgarh. @{clean_handle}",
            follower_count=32100,
        )

    def fetch_content(
        self,
        handle: str,
        *,
        cursor: str | None = None,
        limit: int = 20,
    ) -> SyncResult:
        clean_handle = self._extract_handle(handle)
        now = datetime.now(timezone.utc)

        items = [
            NormalizedSocialItem(
                provider=SocialPlatform.INSTAGRAM,
                provider_content_id=f"ig_{clean_handle}_reel_1",
                content_type=ContentType.REEL,
                title="Monsoon Trek to Amrit Dhara Falls, Koriya",
                description="The hidden beauty of northern Chhattisgarh in the rains! #koriya #amritdhara #chhattisgarhdiaries",
                source_url=f"https://www.instagram.com/reel/ig_{clean_handle}_reel_1/",
                thumbnail_url="https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80",
                published_at=now,
                duration_seconds=30,
                aspect_ratio="9:16",
                view_count=28900,
                like_count=2100,
                hashtags=["koriya", "amritdhara", "chhattisgarhdiaries"],
                raw_metadata={"media_type": "VIDEO", "permalink": f"https://www.instagram.com/reel/ig_{clean_handle}_reel_1/"},
            ),
            NormalizedSocialItem(
                provider=SocialPlatform.INSTAGRAM,
                provider_content_id=f"ig_{clean_handle}_post_1",
                content_type=ContentType.POST,
                title="Bastar Dussehra Sirhasar Bhawan Gathering",
                description="75 days of world's longest festival. Honoring Ma Danteshwari and tribal chieftains. #bastardussehra",
                source_url=f"https://www.instagram.com/p/ig_{clean_handle}_post_1/",
                thumbnail_url="https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800&q=80",
                published_at=now,
                aspect_ratio="1:1",
                view_count=8400,
                like_count=980,
                hashtags=["bastardussehra", "culture", "chhattisgarh"],
                raw_metadata={"media_type": "IMAGE", "permalink": f"https://www.instagram.com/p/ig_{clean_handle}_post_1/"},
            ),
        ]
        return SyncResult(items=items[:limit], next_cursor=None, has_more=False)

    def get_content(self, provider_content_id: str) -> ProviderContent | None:
        now = datetime.now(timezone.utc)
        is_reel = "reel" in provider_content_id.lower()
        return ProviderContent(
            external_id=provider_content_id,
            content_type=SocialContentType.REEL if is_reel else SocialContentType.POST,
            title="Monsoon Trek to Amrit Dhara Falls",
            description="The hidden beauty of northern Chhattisgarh in the rains!",
            source_url=f"https://www.instagram.com/p/{provider_content_id}/",
            thumbnail_url="https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80",
            published_at=now,
            duration_seconds=30 if is_reel else None,
            aspect_ratio="9:16" if is_reel else "1:1",
            view_count=28900,
            like_count=2100,
        )
