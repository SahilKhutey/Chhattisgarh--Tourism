from __future__ import annotations

import re

from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.handles.normalizer import normalize_handle

YOUTUBE_HANDLE_REGEX = re.compile(r"^[a-z0-9._-]{3,30}$")
INSTAGRAM_HANDLE_REGEX = re.compile(r"^[a-z0-9._]{1,30}$")


class SocialHandleValidator:
    """Validates platform-specific social handle syntax."""

    @classmethod
    def validate(cls, platform: SocialPlatform | str, handle: str) -> str:
        if isinstance(platform, str):
            platform = SocialPlatform(platform)

        normalized = normalize_handle(handle)

        if platform == SocialPlatform.YOUTUBE:
            cls._validate_youtube(normalized)
        elif platform == SocialPlatform.INSTAGRAM:
            cls._validate_instagram(normalized)
        else:
            raise ValueError(f"Unsupported platform for handle validation: {platform}")

        return normalized

    @staticmethod
    def _validate_youtube(handle: str) -> None:
        if len(handle) < 3 or len(handle) > 30:
            raise ValueError(
                f"YouTube handle must be between 3 and 30 characters, got {len(handle)}: '{handle}'"
            )
        if not YOUTUBE_HANDLE_REGEX.match(handle):
            raise ValueError(
                f"Invalid YouTube handle syntax: '{handle}'. "
                "Only alphanumeric characters, dots, hyphens, and underscores are allowed."
            )

    @staticmethod
    def _validate_instagram(handle: str) -> None:
        if len(handle) < 1 or len(handle) > 30:
            raise ValueError(
                f"Instagram handle must be between 1 and 30 characters, got {len(handle)}: '{handle}'"
            )
        if handle.startswith("."):
            raise ValueError(f"Instagram handle cannot start with a period: '{handle}'")
        if handle.endswith("."):
            raise ValueError(f"Instagram handle cannot end with a period: '{handle}'")
        if ".." in handle:
            raise ValueError(f"Instagram handle cannot contain consecutive periods: '{handle}'")
        if not INSTAGRAM_HANDLE_REGEX.match(handle):
            raise ValueError(
                f"Invalid Instagram handle syntax: '{handle}'. "
                "Only alphanumeric characters, dots, and underscores are allowed."
            )


__all__ = ["SocialHandleValidator"]
