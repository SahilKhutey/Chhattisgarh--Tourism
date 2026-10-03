from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings


class SocialSettings(BaseSettings):
    social_engine_enabled: bool = False

    social_sync_enabled: bool = False

    social_default_page_size: int = Field(
        default=20,
        ge=1,
        le=100,
    )

    social_max_content_age_days: int = Field(
        default=90,
        ge=1,
    )

    social_sync_timeout_seconds: int = Field(
        default=30,
        ge=5,
        le=120,
    )

    social_require_acceptance: bool = True

    social_allowed_platforms: str = "youtube,instagram"

    @property
    def allowed_platforms(self) -> set[str]:
        return {
            platform.strip().lower()
            for platform in self.social_allowed_platforms.split(",")
            if platform.strip()
        }
