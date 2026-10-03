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


class YouTubeProvider(SocialProvider):
    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key

    def _extract_handle(self, handle_or_url: str) -> str:
        clean = handle_or_url.strip()
        match = re.search(r"(?:youtube\.com/)?@?([\w\-\.]+)", clean)
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

        # In production with self.api_key, call https://www.googleapis.com/youtube/v3/channels
        # Here we provide deterministic metadata resolution
        return SocialAccountProfile(
            handle=handle,
            display_name=f"{handle.replace('_', ' ').title()} CG",
            profile_image_url=f"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
            bio=f"Official YouTube channel for @{handle} showcasing Chhattisgarh travel corridors.",
            provider_channel_id=f"UC_{handle[:12]}",
            follower_or_subscriber_count=18500,
            is_valid=True,
            metadata={"platform": "YOUTUBE", "custom_url": f"https://youtube.com/@{handle}"},
        )

    def fetch_content(
        self,
        handle: str,
        cursor: str | None = None,
        limit: int = 20,
    ) -> SyncResult:
        clean_handle = self._extract_handle(handle)
        now = datetime.now(timezone.utc)

        # Realistic normalized items simulating sync
        items = [
            NormalizedSocialItem(
                provider=SocialPlatform.YOUTUBE,
                provider_content_id=f"yt-{clean_handle}-vid-01",
                content_type=ContentType.VIDEO,
                title="Exploring Chitrakote Falls & Indravati River Gorge",
                description="Comprehensive travel guide to visiting the Niagara of India during peak flow.",
                source_url=f"https://www.youtube.com/watch?v=yt-{clean_handle}-vid-01",
                thumbnail_url="https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&q=80",
                published_at=now,
                duration_seconds=420,
                aspect_ratio="16:9",
                view_count=8400,
                like_count=650,
                hashtags=["Chitrakote", "Bastar", "ChhattisgarhTourism"],
                raw_metadata={"channelTitle": clean_handle},
            ),
            NormalizedSocialItem(
                provider=SocialPlatform.YOUTUBE,
                provider_content_id=f"yt-{clean_handle}-short-02",
                content_type=ContentType.SHORT,
                title="Bastar Dussehra 8-Wheeled Chariot in 60 Seconds #Shorts",
                description="The sacred 75-day festival of Maa Danteshwari.",
                source_url=f"https://www.youtube.com/shorts/yt-{clean_handle}-short-02",
                thumbnail_url="https://images.unsplash.com/photo-1609137144820-221f1d166df2?w=800&q=80",
                published_at=now,
                duration_seconds=58,
                aspect_ratio="9:16",
                view_count=19200,
                like_count=1840,
                hashtags=["Shorts", "BastarDussehra", "TribalHeritage"],
                raw_metadata={"channelTitle": clean_handle},
            ),
        ]

        return SyncResult(
            items=items[:limit],
            next_cursor=None,
            has_more=False,
        )
