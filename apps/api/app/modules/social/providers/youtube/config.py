from __future__ import annotations

from dataclasses import dataclass
from app.modules.social.config import SocialSettings, get_social_settings


@dataclass(frozen=True, slots=True)
class YouTubeConfig:
    api_key: str | None
    base_url: str = "https://www.googleapis.com/youtube/v3"
    enabled: bool = False
    max_results: int = 50
    max_pages_per_sync: int = 3
    max_videos_per_sync: int = 150
    request_timeout_seconds: float = 15.0
    retry_attempts: int = 3
    retry_base_delay_seconds: float = 1.0
    max_content_age_days: int = 90

    @classmethod
    def from_settings(cls, settings: SocialSettings | None = None) -> YouTubeConfig:
        s = settings or get_social_settings()
        return cls(
            api_key=s.youtube_api_key,
            base_url=s.youtube_api_base_url,
            enabled=s.social_youtube_enabled,
            max_results=s.social_youtube_max_results,
            max_pages_per_sync=s.social_youtube_max_pages_per_sync,
            max_videos_per_sync=s.social_youtube_max_videos_per_sync,
            request_timeout_seconds=s.social_youtube_request_timeout_seconds,
            retry_attempts=s.social_youtube_retry_attempts,
            retry_base_delay_seconds=s.social_youtube_retry_base_delay_seconds,
            max_content_age_days=s.social_youtube_max_content_age_days,
        )


__all__ = ["YouTubeConfig"]
