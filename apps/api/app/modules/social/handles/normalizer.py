from __future__ import annotations

import re
from dataclasses import dataclass

from app.modules.social.domain.enums import SocialPlatform


@dataclass(frozen=True, slots=True)
class SocialHandle:
    platform: SocialPlatform
    raw_handle: str
    normalized_handle: str

    def __str__(self) -> str:
        return f"@{self.normalized_handle}"


def normalize_handle(handle: str) -> str:
    """Normalize a social media handle.

    - Strips leading/trailing whitespace
    - Removes leading '@' characters
    - Strips leading/trailing slashes
    - Converts to lowercase
    - Raises ValueError if the resulting handle is empty
    """
    if not handle or not isinstance(handle, str):
        raise ValueError("Social handle cannot be empty.")

    cleaned = handle.strip()
    # Remove leading '@' characters
    cleaned = cleaned.lstrip("@").strip()
    # Remove leading/trailing slashes
    cleaned = cleaned.strip("/").strip()
    # Lowercase
    cleaned = cleaned.lower()

    if not cleaned:
        raise ValueError("Social handle cannot be empty.")

    return cleaned


class SocialHandleNormalizer:
    """Platform-aware social handle normalizer."""

    @staticmethod
    def normalize(platform: SocialPlatform | str, handle: str) -> SocialHandle:
        if isinstance(platform, str):
            platform = SocialPlatform(platform)

        normalized = normalize_handle(handle)
        return SocialHandle(
            platform=platform,
            raw_handle=handle,
            normalized_handle=normalized,
        )


__all__ = ["SocialHandle", "normalize_handle", "SocialHandleNormalizer"]
