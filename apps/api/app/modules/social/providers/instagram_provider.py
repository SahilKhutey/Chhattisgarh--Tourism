from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

from app.modules.social.domain.enums import ContentType, SocialPlatform
from app.modules.social.providers.base import (
    NormalizedSocialItem,
    SocialAccountProfile,
    SocialProvider,
    SyncResult,
)


class InstagramProvider(SocialProvider):
    def __init__(self, access_token: str | None = None) -> None:
        self.access_token = access_token

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
            bio=f"Chhattisgarh storyteller & travel creator. Capturing unseen 36 Garh.",
            provider_channel_id=f"ig_{handle}",
            follower_or_subscriber_count=24800,
            is_valid=True,
            metadata={"platform": "INSTAGRAM", "profile_url": f"https://instagram.com/{handle}"},
        )

    def fetch_content(
        self,
        handle: str,
        cursor: str | None = None,
        limit: int = 20,
    ) -> SyncResult:
        clean_handle = self._extract_handle(handle)
        now = datetime.now(timezone.utc)

        items = [
            NormalizedSocialItem(
                provider=SocialPlatform.INSTAGRAM,
                provider_content_id=f"ig-{clean_handle}-reel-01",
                content_type=ContentType.REEL,
                title="Lost-Wax Dhokra Bronze Casting in Kondagaon",
                description="4,000-year-old Harappan lost wax bronze casting alive today in Bastar artisan villages.",
                source_url=f"https://www.instagram.com/reel/ig-{clean_handle}-reel-01/",
                thumbnail_url="https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=800&q=80",
                published_at=now,
                duration_seconds=32,
                aspect_ratio="9:16",
                view_count=14200,
                like_count=2100,
                hashtags=["Dhokra", "Kondagaon", "CraftsOfIndia"],
                raw_metadata={"username": clean_handle},
            ),
            NormalizedSocialItem(
                provider=SocialPlatform.INSTAGRAM,
                provider_content_id=f"ig-{clean_handle}-post-02",
                content_type=ContentType.POST,
                title="Morning Sun over Indravati Indravati Gorge",
                description="Peaceful sunrise along the river trail before the crowds arrive.",
                source_url=f"https://www.instagram.com/p/ig-{clean_handle}-post-02/",
                thumbnail_url="https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&q=80",
                published_at=now,
                duration_seconds=None,
                aspect_ratio="1:1",
                view_count=5200,
                like_count=980,
                hashtags=["Indravati", "Sunrise", "ChhattisgarhTravel"],
                raw_metadata={"username": clean_handle},
            ),
        ]

        return SyncResult(
            items=items[:limit],
            next_cursor=None,
            has_more=False,
        )
