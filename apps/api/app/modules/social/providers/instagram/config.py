from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.modules.social.config import SocialSettings


@dataclass(slots=True)
class InstagramConfig:
    """Runtime configuration for Meta Graph API Instagram integration."""
    base_url: str = "https://graph.facebook.com"
    api_version: str = "v21.0"
    client_id: str | None = None
    client_secret: str | None = None
    timeout: float = 15.0
    max_results: int = 50
    max_pages: int = 3
    max_media: int = 150
    retry_attempts: int = 3
    retry_base_delay: float = 1.0

    @classmethod
    def from_settings(cls, settings: SocialSettings) -> InstagramConfig:
        return cls(
            base_url=settings.meta_graph_api_base_url,
            api_version=settings.instagram_api_version,
            client_id=settings.instagram_client_id,
            client_secret=settings.instagram_client_secret,
            timeout=settings.social_instagram_request_timeout_seconds,
            max_results=settings.social_instagram_max_results,
            max_pages=settings.social_instagram_max_pages_per_sync,
            max_media=settings.social_instagram_max_media_per_sync,
            retry_attempts=settings.social_instagram_retry_attempts,
            retry_base_delay=settings.social_instagram_retry_base_delay_seconds,
        )


__all__ = ["InstagramConfig"]
