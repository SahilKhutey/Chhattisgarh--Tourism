from __future__ import annotations

import re
from urllib.parse import urlparse

from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.domain.errors import SourceUrlError
from app.modules.social.domain.value_objects import SourceUrl


class SourceValidator:
    ALLOWED_SCHEMES = frozenset({"http", "https"})

    YOUTUBE_HOSTS = frozenset({
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
    })

    INSTAGRAM_HOSTS = frozenset({
        "instagram.com",
        "www.instagram.com",
    })

    @classmethod
    def validate_url(cls, url: str) -> SourceUrl:
        return SourceUrl.from_raw(url)

    @classmethod
    def validate_platform_url(cls, url: str, expected_platform: SocialPlatform) -> SourceUrl:
        validated = cls.validate_url(url)
        parsed = urlparse(validated.value)
        host = (parsed.hostname or "").lower()

        if expected_platform == SocialPlatform.YOUTUBE:
            if not any(host == h or host.endswith("." + h) for h in cls.YOUTUBE_HOSTS):
                raise SourceUrlError(f"URL host '{host}' does not belong to YouTube.")
        elif expected_platform == SocialPlatform.INSTAGRAM:
            if not any(host == h or host.endswith("." + h) for h in cls.INSTAGRAM_HOSTS):
                raise SourceUrlError(f"URL host '{host}' does not belong to Instagram.")
        return validated

    @classmethod
    def extract_handle_from_url(cls, url: str, platform: SocialPlatform) -> str | None:
        try:
            parsed = urlparse(url.strip())
            path = parsed.path.strip("/")
            if platform == SocialPlatform.YOUTUBE:
                # Matches @handle or /c/handle or /user/handle
                match = re.search(r"@?([\w\-\.]+)", path)
                return match.group(1).lstrip("@") if match else None
            elif platform == SocialPlatform.INSTAGRAM:
                parts = [p for p in path.split("/") if p]
                if parts and parts[0] not in ("p", "reel", "stories", "tv"):
                    return parts[0].lstrip("@")
                return None
        except Exception:
            return None
        return None
