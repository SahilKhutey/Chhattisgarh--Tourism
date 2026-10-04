from __future__ import annotations

import re
from urllib.parse import urlparse

from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.domain.errors import SourceUrlError
from app.modules.social.domain.value_objects import SourceUrl

PLATFORM_HOSTS = {
    SocialPlatform.YOUTUBE: {
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
    },
    SocialPlatform.INSTAGRAM: {
        "instagram.com",
        "www.instagram.com",
    },
}


class SocialAccountValidator:
    """Validates social accounts, profile URLs, platform boundaries, and handle structures."""

    def validate_url(
        self,
        *,
        platform: SocialPlatform | str,
        profile_url: str,
    ) -> None:
        p_enum = SocialPlatform(platform) if isinstance(platform, str) else platform
        if p_enum not in PLATFORM_HOSTS:
            raise ValueError(f"Platform '{p_enum}' is not supported.")

        if not profile_url or not isinstance(profile_url, str):
            raise ValueError("Profile URL must be a non-empty string.")

        source = SourceUrl.from_raw(profile_url)
        hostname = source.hostname

        if hostname not in PLATFORM_HOSTS[p_enum]:
            raise ValueError(f"URL does not belong to {p_enum.value}.")

    def extract_path(
        self,
        profile_url: str,
    ) -> str:
        return urlparse(profile_url).path.strip("/")

    def extract_handle(
        self,
        platform: SocialPlatform | str,
        profile_url: str,
    ) -> str | None:
        p_enum = SocialPlatform(platform) if isinstance(platform, str) else platform
        path = self.extract_path(profile_url)

        if p_enum == SocialPlatform.YOUTUBE:
            match = re.search(r"@?([\w\-\.]+)", path)
            return match.group(1).lstrip("@") if match else None
        elif p_enum == SocialPlatform.INSTAGRAM:
            parts = [p for p in path.split("/") if p]
            if parts and parts[0] not in ("p", "reel", "stories", "tv"):
                return parts[0].lstrip("@")
            return None
        return None

    def validate_handle(self, handle: str) -> str:
        clean = re.sub(r"^@", "", (handle or "").strip())
        if not clean:
            raise ValueError("Social handle cannot be empty.")
        if len(clean) < 1 or len(clean) > 128:
            raise ValueError("Social handle length must be between 1 and 128 characters.")
        if not re.match(r"^[\w\-\.]+$", clean):
            raise ValueError("Social handle contains invalid characters.")
        return clean


__all__ = ["PLATFORM_HOSTS", "SocialAccountValidator"]
