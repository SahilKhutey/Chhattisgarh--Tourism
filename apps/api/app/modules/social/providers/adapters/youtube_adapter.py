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


class YouTubeAdapter(SocialProvider):
    platform = SocialPlatform.YOUTUBE

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key

    def capabilities(self) -> ProviderCapabilities:
        return ProviderCapabilities(
            supports_posts=False,
            supports_reels=False,
            supports_shorts=True,
            supports_videos=True,
            supports_stories=False,
            supports_embeds=True,
        )

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

        return SocialAccountProfile(
            handle=handle,
            display_name=f"{handle.replace('_', ' ').title()} CG",
            profile_image_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
            bio=f"Official YouTube channel for @{handle} showcasing Chhattisgarh travel corridors.",
            provider_channel_id=f"UC_{handle[:12]}",
            follower_or_subscriber_count=18500,
            is_valid=True,
            metadata={"platform": "YOUTUBE", "custom_url": f"https://youtube.com/@{handle}"},
        )

    def fetch_profile(self, handle: str) -> ProviderAccount:
        clean_handle = self._extract_handle(handle)
        return ProviderAccount(
            external_id=f"UC_{clean_handle[:12]}",
            handle=clean_handle,
            display_name=f"{clean_handle.replace('_', ' ').title()} CG",
            profile_url=f"https://youtube.com/@{clean_handle}",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
            bio=f"Official YouTube channel for @{clean_handle} showcasing Chhattisgarh travel corridors.",
            follower_count=18500,
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
                provider=SocialPlatform.YOUTUBE,
                provider_content_id=f"yt_{clean_handle}_001",
                content_type=ContentType.VIDEO,
                title="Majestic Chitrakote Falls in Full Monsoon Surge",
                description="Witnessing the Niagara of India during peak monsoon flow in Bastar district. #chhattisgarh #bastar #waterfalls",
                source_url=f"https://www.youtube.com/watch?v=yt_{clean_handle}_001",
                thumbnail_url="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
                published_at=now,
                duration_seconds=420,
                aspect_ratio="16:9",
                view_count=12400,
                like_count=890,
                hashtags=["chhattisgarh", "bastar", "waterfalls"],
                raw_metadata={"tags": ["Chitrakote", "Waterfalls", "Bastar", "Monsoon"]},
            ),
            NormalizedSocialItem(
                provider=SocialPlatform.YOUTUBE,
                provider_content_id=f"yt_{clean_handle}_002",
                content_type=ContentType.SHORT,
                title="Bastar Dhokra Bell Metal Craft Casting #Shorts",
                description="Lost-wax casting technique preserved by local artisans in Kondagaon. #bastarart #dhokra",
                source_url=f"https://www.youtube.com/shorts/yt_{clean_handle}_002",
                thumbnail_url="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80",
                published_at=now,
                duration_seconds=58,
                aspect_ratio="9:16",
                view_count=45200,
                like_count=3400,
                hashtags=["bastarart", "dhokra"],
                raw_metadata={"tags": ["Dhokra", "Craft", "TribalArt"]},
            ),
        ]
        return SyncResult(items=items[:limit], next_cursor=None, has_more=False)

    def get_content(self, provider_content_id: str) -> ProviderContent | None:
        now = datetime.now(timezone.utc)
        return ProviderContent(
            external_id=provider_content_id,
            content_type=SocialContentType.SHORT if "shorts" in provider_content_id.lower() or "002" in provider_content_id else SocialContentType.VIDEO,
            title="Majestic Chitrakote Falls",
            description="Witnessing the Niagara of India during peak monsoon flow in Bastar district.",
            source_url=f"https://www.youtube.com/watch?v={provider_content_id}",
            thumbnail_url="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
            published_at=now,
            duration_seconds=420,
            aspect_ratio="16:9",
            view_count=12400,
            like_count=890,
        )
