from __future__ import annotations

import inspect
import logging
from typing import Any

from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.providers.base import (
    ProviderAccount,
    ProviderCapabilities,
    ProviderContent,
    SocialAccountProfile,
    SocialProvider,
    SyncResult,
)
from app.modules.social.providers.youtube.client import YouTubeClient
from app.modules.social.providers.youtube.errors import (
    YouTubeAccountNotFoundError,
    YouTubeProviderError,
)
from app.modules.social.providers.youtube.models import YouTubeChannel
from app.modules.social.providers.youtube.parser import (
    parse_youtube_profile,
    youtube_channel_url,
)

logger = logging.getLogger(__name__)


class YouTubeAdapter(SocialProvider):
    """Adapter bridging YouTube Data API v3 with CG Tourism Social Engine."""

    platform = SocialPlatform.YOUTUBE

    def __init__(
        self,
        client: YouTubeClient | None = None,
        api_key: str | None = None,
    ) -> None:
        if client is not None:
            self.client = client
        elif api_key:
            self.client = YouTubeClient(api_key=api_key)
        else:
            self.client = None

    def capabilities(self) -> ProviderCapabilities:
        return ProviderCapabilities(
            supports_posts=False,
            supports_reels=False,
            supports_shorts=True,
            supports_videos=True,
            supports_stories=False,
            supports_embeds=True,
        )

    async def get_channel(self, identifier: str) -> YouTubeChannel:
        """Fetches YouTube channel metadata via handle or channel ID."""
        if self.client is None:
            # Fallback mock channel for offline/unit-test mode
            try:
                kind, clean = parse_youtube_profile(identifier)
            except Exception:
                clean = identifier.strip().lstrip("@")
            return YouTubeChannel(
                channel_id=f"UC_{clean[:16]}",
                handle=f"@{clean}",
                title=f"{clean.replace('_', ' ').title()} CG",
                description=f"Official YouTube channel for @{clean}",
                thumbnail_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
                uploads_playlist_id=f"UU_{clean[:16]}",
            )

        kind, val = parse_youtube_profile(identifier)
        if kind == "channel_id":
            payload = await self.client.get_channel_by_id(val)
        else:
            payload = await self.client.get_channel_by_handle(val)

        items = payload.get("items", [])
        if not items:
            raise YouTubeAccountNotFoundError(f"YouTube channel was not found for '{identifier}'.")

        ch = items[0]
        snippet = ch.get("snippet", {})
        content_details = ch.get("contentDetails", {})
        related = content_details.get("relatedPlaylists", {})
        stats = ch.get("statistics", {})

        thumbnails = snippet.get("thumbnails", {})
        thumbnail_url = None
        for k in ("high", "medium", "default"):
            if k in thumbnails:
                thumbnail_url = thumbnails[k].get("url")
                break

        return YouTubeChannel(
            channel_id=ch["id"],
            handle=snippet.get("customUrl"),
            title=snippet.get("title", ""),
            description=snippet.get("description"),
            thumbnail_url=thumbnail_url,
            uploads_playlist_id=related.get("uploads"),
            custom_url=snippet.get("customUrl"),
            subscriber_count=int(stats.get("subscriberCount", 0)),
            video_count=int(stats.get("videoCount", 0)),
            raw_metadata=ch,
        )

    def verify_account(self, handle_or_url: str) -> SocialAccountProfile:
        """Synchronous wrapper for account verification protocol."""
        res = self.verify_account_async(handle_or_url)
        if inspect.isawaitable(res):
            import asyncio
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    import concurrent.futures
                    with concurrent.futures.ThreadPoolExecutor() as pool:
                        return pool.submit(asyncio.run, res).result()
                else:
                    return loop.run_until_complete(res)
            except RuntimeError:
                return asyncio.run(res)
        return res

    async def verify_account_async(self, handle_or_url: str) -> SocialAccountProfile:
        """Asynchronously verifies YouTube channel existence and extracts uploads playlist."""
        try:
            channel = await self.get_channel(handle_or_url)
            return SocialAccountProfile(
                handle=channel.handle or handle_or_url,
                display_name=channel.title,
                profile_image_url=channel.thumbnail_url,
                bio=channel.description,
                provider_channel_id=channel.channel_id,
                follower_or_subscriber_count=channel.subscriber_count,
                is_valid=True,
                metadata={
                    "platform": "YOUTUBE",
                    "channel_id": channel.channel_id,
                    "uploads_playlist_id": channel.uploads_playlist_id,
                    "custom_url": channel.custom_url,
                    "profile_url": youtube_channel_url(channel.channel_id),
                },
            )
        except YouTubeAccountNotFoundError:
            return SocialAccountProfile(
                handle=handle_or_url,
                display_name=handle_or_url,
                is_valid=False,
                metadata={"error": "channel_not_found"},
            )
        except Exception as exc:
            logger.warning("YouTube verification error for '%s': %s", handle_or_url, exc)
            return SocialAccountProfile(
                handle=handle_or_url,
                display_name=handle_or_url,
                is_valid=False,
                metadata={"error": str(exc)},
            )

    def fetch_profile(self, handle: str) -> ProviderAccount:
        prof = self.verify_account(handle)
        return ProviderAccount(
            external_id=prof.provider_channel_id or f"UC_{handle}",
            handle=prof.handle,
            display_name=prof.display_name,
            profile_url=youtube_channel_url(prof.provider_channel_id or handle),
            avatar_url=prof.profile_image_url,
            bio=prof.bio,
            follower_count=prof.follower_or_subscriber_count,
            raw_metadata=prof.metadata,
        )

    def fetch_content(
        self,
        handle: str,
        *,
        cursor: str | None = None,
        limit: int = 20,
    ) -> SyncResult:
        # Legacy fallback
        from app.modules.social.providers.adapters.youtube_adapter import (
            YouTubeAdapter as LegacyYouTubeAdapter,
        )
        legacy = LegacyYouTubeAdapter()
        return legacy.fetch_content(handle, cursor=cursor, limit=limit)

    def get_content(self, provider_content_id: str) -> ProviderContent | None:
        return None


YouTubeProvider = YouTubeAdapter

__all__ = ["YouTubeAdapter", "YouTubeProvider"]
