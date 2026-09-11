import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_missing_database_url_fails(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv(
        "REDIS_URL",
        "redis://localhost:6379/0",
    )
    monkeypatch.setenv(
        "JWT_SECRET",
        "test-secret",
    )

    with pytest.raises(ValidationError):
        Settings(_env_file=None)


def test_missing_jwt_secret_fails(monkeypatch):
    monkeypatch.setenv(
        "DATABASE_URL",
        "postgresql+psycopg://test:test@localhost/test",
    )
    monkeypatch.setenv(
        "REDIS_URL",
        "redis://localhost:6379/0",
    )
    monkeypatch.delenv("JWT_SECRET", raising=False)

    with pytest.raises(ValidationError):
        Settings(_env_file=None)


def test_valid_settings(monkeypatch):
    monkeypatch.setenv(
        "DATABASE_URL",
        "postgresql+psycopg://test:test@localhost/test",
    )
    monkeypatch.setenv(
        "REDIS_URL",
        "redis://localhost:6379/0",
    )
    monkeypatch.setenv(
        "JWT_SECRET",
        "valid-secret",
    )
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:3000, https://cg-tourism.in")
    monkeypatch.setenv("SUPPORTED_LOCALES", "en, hi, chg")

    settings = Settings(_env_file=None)
    assert settings.database_url == "postgresql+psycopg://test:test@localhost/test"
    assert settings.jwt_secret == "valid-secret"
    assert settings.cors_origin_list == ["http://localhost:3000", "https://cg-tourism.in"]
    assert settings.locale_list == ["en", "hi", "chg"]
    assert settings.is_production is False
