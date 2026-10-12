from __future__ import annotations

import re
from urllib.parse import urlparse
from typing import Any

from app.modules.social.domain.enums import (
    CulturalSensitivityLevel,
    SocialContentStatus,
    SocialPlatform,
)
from app.modules.social.models.social_content import SocialContent


ALLOWED_PROVIDER_HOSTS = {
    SocialPlatform.YOUTUBE.value: {
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
    },
    SocialPlatform.INSTAGRAM.value: {
        "instagram.com",
        "www.instagram.com",
    },
}


class SocialContentPolicy:
    """
    Validation and cultural protection policies for social content.
    """

    @staticmethod
    def validate_source_url(source_url: str, platform: str) -> tuple[bool, str]:
        """
        Validates source URL against allowed provider domains to protect against SSRF.
        """
        if not source_url:
            return False, "source_url is required"

        try:
            parsed = urlparse(source_url)
            if parsed.scheme not in ("http", "https"):
                return False, f"Invalid URL scheme '{parsed.scheme}'; expected https"

            hostname = (parsed.hostname or "").lower()
            norm_platform = platform.lower()
            allowed = ALLOWED_PROVIDER_HOSTS.get(norm_platform, set())

            if hostname not in allowed:
                return False, f"Host '{hostname}' is not in the allowed domain list for platform '{platform}'"

            return True, ""
        except Exception as exc:
            return False, f"Malformed URL: {exc}"

    @staticmethod
    def is_moderatable(content: SocialContent) -> bool:
        """Content is eligible for human review in VALIDATED, UNDER_REVIEW, DISCOVERED, or SYNCED status."""
        status_val = content.status.value if hasattr(content.status, "value") else str(content.status).lower()
        return status_val in {
            SocialContentStatus.VALIDATED.value,
            SocialContentStatus.UNDER_REVIEW.value,
            SocialContentStatus.DISCOVERED.value,
            SocialContentStatus.SYNCED.value,
        }

    @staticmethod
    def validate_cultural_protection(content: SocialContent) -> tuple[bool, list[str]]:
        """
        Validates community attribution and clan consent for sacred/cultural content.
        Section 9.28.
        """
        issues: list[str] = []
        sensitivity = getattr(content, "cultural_sensitivity", CulturalSensitivityLevel.STANDARD)
        has_consent = getattr(content, "has_sacred_consent", False)
        attribution = getattr(content, "community_attribution", None)

        sensitivity_val = sensitivity.value if hasattr(sensitivity, "value") else str(sensitivity)
        if sensitivity_val in {
            CulturalSensitivityLevel.SACRED_RITUAL.value,
            CulturalSensitivityLevel.COMMUNITY_PROTECTED.value,
        }:
            if not has_consent:
                issues.append(
                    f"Content flagged as '{sensitivity_val}' requires verified community consent before publication."
                )
            if not attribution or not attribution.strip():
                issues.append(
                    f"Content flagged as '{sensitivity_val}' requires explicit community attribution."
                )

        return len(issues) == 0, issues


__all__ = ["SocialContentPolicy", "ALLOWED_PROVIDER_HOSTS"]
