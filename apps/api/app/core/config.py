import os
from functools import lru_cache
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_REPO_ROOT = Path(__file__).resolve().parents[4]
_APP_ROOT = Path(__file__).resolve().parents[2]

_env_candidates = [
    str(_REPO_ROOT / ".env"),
    str(_APP_ROOT / ".env"),
    ".env",
]
if os.getenv("APP_ENV", "development").lower() != "production":
    _env_candidates.extend([
        str(_REPO_ROOT / ".env.development"),
        str(_APP_ROOT / ".env.development"),
        ".env.development",
    ])


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_env_candidates,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "CG Tourism API"
    app_env: str = Field(default="development")
    app_debug: bool = False
    api_prefix: str = "/api"

    database_url: str
    redis_url: str

    frontend_url: str = "http://localhost:3000"
    secret_key: str = "CHANGE_ME_IN_PRODUCTION"

    jwt_secret: str
    jwt_algorithm: str = "HS256"

    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 30

    cache_ttl_seconds: int = 300

    cors_origins: str = "http://localhost:3000"

    default_locale: str = "en"
    supported_locales: str = "en,hi,chg"

    log_level: str = "INFO"

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def cors_origin_list(self) -> list[str]:
        if not self.cors_origins:
            return []

        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]

    @property
    def locale_list(self) -> list[str]:
        return [
            locale.strip()
            for locale in self.supported_locales.split(",")
            if locale.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
