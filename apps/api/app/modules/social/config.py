from __future__ import annotations

from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class SocialSettings(BaseSettings):
    model_config = SettingsConfigDict(
        case_sensitive=False,
        extra="ignore",
    )

    social_engine_enabled: bool = False
    social_sync_enabled: bool = False

    # YouTube Specific Settings
    social_youtube_enabled: bool = False
    youtube_api_key: str | None = None
    youtube_api_base_url: str = "https://www.googleapis.com/youtube/v3"
    social_youtube_max_results: int = Field(default=50, ge=1, le=50)
    social_youtube_max_pages_per_sync: int = Field(default=3, ge=1, le=20)
    social_youtube_max_videos_per_sync: int = Field(default=150, ge=1, le=500)
    social_youtube_request_timeout_seconds: float = Field(default=15.0, ge=1.0)
    social_youtube_retry_attempts: int = Field(default=3, ge=1, le=10)
    social_youtube_retry_base_delay_seconds: float = Field(default=1.0, ge=0.1)
    social_youtube_max_content_age_days: int = Field(default=90, ge=1)

    # Instagram Specific Settings
    social_instagram_enabled: bool = False
    meta_graph_api_base_url: str = "https://graph.facebook.com"
    instagram_api_version: str = "v21.0"
    instagram_client_id: str | None = None
    instagram_client_secret: str | None = None
    social_instagram_max_results: int = Field(default=50, ge=1, le=100)
    social_instagram_max_pages_per_sync: int = Field(default=3, ge=1, le=20)
    social_instagram_max_media_per_sync: int = Field(default=150, ge=1, le=500)
    social_instagram_request_timeout_seconds: float = Field(default=15.0, ge=1.0)
    social_instagram_retry_attempts: int = Field(default=3, ge=1, le=10)
    social_instagram_retry_base_delay_seconds: float = Field(default=1.0, ge=0.1)

    # General Social Settings
    social_default_page_size: int = Field(default=20, ge=1, le=100)
    social_max_content_age_days: int = Field(default=90, ge=1)
    social_sync_timeout_seconds: int = Field(default=30, ge=5, le=120)
    social_require_acceptance: bool = True
    social_allowed_platforms: str = "youtube,instagram"

    def validate_youtube_configuration(self) -> None:
        if self.social_youtube_enabled:
            if not self.youtube_api_key:
                raise ValueError("YOUTUBE_API_KEY is required when YouTube integration is enabled.")

    def validate_instagram_configuration(self) -> None:
        if self.social_instagram_enabled:
            if not self.instagram_client_id or not self.instagram_client_secret:
                raise ValueError("INSTAGRAM_CLIENT_ID and INSTAGRAM_CLIENT_SECRET are required when Instagram integration is enabled.")

    @property
    def allowed_platforms(self) -> set[str]:
        return {
            platform.strip().lower()
            for platform in self.social_allowed_platforms.split(",")
            if platform.strip()
        }


@lru_cache(maxsize=1)
def get_social_settings() -> SocialSettings:
    return SocialSettings()


__all__ = ["SocialSettings", "get_social_settings"]
