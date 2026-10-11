from __future__ import annotations

import re
from urllib.parse import urlparse

from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.handles.normalizer import normalize_handle
from app.modules.social.handles.validator import SocialHandleValidator

_YOUTUBE_HOSTS = {"youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"}
_INSTAGRAM_HOSTS = {"instagram.com", "www.instagram.com", "m.instagram.com"}


class SocialHandleResolver:
    """Resolves raw handle strings or profile URLs into a platform and normalized handle."""

    @classmethod
    def resolve(
        cls,
        input_value: str,
        default_platform: SocialPlatform | str | None = None,
    ) -> tuple[SocialPlatform, str]:
        if not input_value or not isinstance(input_value, str):
            raise ValueError("Input value to resolve cannot be empty.")

        cleaned = input_value.strip()

        # Check if it looks like a URL
        if cleaned.startswith("http://") or cleaned.startswith("https://") or "youtube.com" in cleaned or "instagram.com" in cleaned:
            platform, raw_handle = cls._resolve_url(cleaned)
        else:
            if not default_platform:
                raise ValueError(
                    f"Cannot determine social platform for raw handle '{input_value}'. "
                    "A platform or full URL must be provided."
                )
            platform = (
                SocialPlatform(default_platform)
                if isinstance(default_platform, str)
                else default_platform
            )
            raw_handle = cleaned

        normalized = SocialHandleValidator.validate(platform, raw_handle)
        return platform, normalized

    @classmethod
    def _resolve_url(cls, url: str) -> tuple[SocialPlatform, str]:
        if not url.startswith("http://") and not url.startswith("https://"):
            url = "https://" + url

        try:
            parsed = urlparse(url)
        except Exception as exc:
            raise ValueError(f"Invalid URL provided for handle resolution: '{url}'") from exc

        host = parsed.netloc.lower()
        path = parsed.path.strip("/")

        if any(h in host for h in _YOUTUBE_HOSTS):
            platform = SocialPlatform.YOUTUBE
            handle = cls._extract_youtube_handle(path)
        elif any(h in host for h in _INSTAGRAM_HOSTS):
            platform = SocialPlatform.INSTAGRAM
            handle = cls._extract_instagram_handle(path)
        else:
            raise ValueError(f"Unsupported host in profile URL: '{host}'")

        return platform, handle

    @staticmethod
    def _extract_youtube_handle(path: str) -> str:
        parts = [p for p in path.split("/") if p]
        if not parts:
            raise ValueError("YouTube URL does not contain a channel handle or path.")

        # Match @handle pattern: @channelName or c/channelName or user/channelName
        first_segment = parts[0]
        if first_segment.startswith("@"):
            return normalize_handle(first_segment)
        if first_segment.lower() in ("c", "user", "channel") and len(parts) > 1:
            return normalize_handle(parts[1])

        # If it's a direct handle segment
        return normalize_handle(first_segment)

    @staticmethod
    def _extract_instagram_handle(path: str) -> str:
        parts = [p for p in path.split("/") if p]
        if not parts:
            raise ValueError("Instagram URL does not contain a username path.")

        # Ignore non-user paths like reels, stories, p, explore
        first_segment = parts[0]
        if first_segment.lower() in ("p", "reel", "reels", "stories", "explore", "tv"):
            raise ValueError(f"Instagram URL path '{path}' does not point to a creator profile.")

        return normalize_handle(first_segment)


__all__ = ["SocialHandleResolver"]
