from __future__ import annotations

from typing import Any
from app.modules.social.domain.errors import SocialEngineError


class InstagramProviderError(SocialEngineError):
    """Base error for all Instagram provider operations."""

    def __init__(
        self,
        message: str,
        *,
        status_code: int | None = None,
        error_code: int | None = None,
        error_subcode: int | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.error_code = error_code
        self.error_subcode = error_subcode
        self.details = details or {}


class InstagramAPIError(InstagramProviderError):
    """Generic error returned by Meta Graph API."""
    pass


class InstagramAuthenticationError(InstagramProviderError):
    """Raised when access token is invalid, expired, or rejected."""
    pass


class InstagramAuthorizationError(InstagramProviderError):
    """Raised when access permissions/scopes are missing or unauthorized."""
    pass


class InstagramRateLimitError(InstagramProviderError):
    """Raised when Meta Graph API call limits are exceeded."""
    pass


class InstagramMediaNotFoundError(InstagramProviderError):
    """Raised when the specified media cannot be found."""
    pass


class InstagramAccountNotFoundError(InstagramProviderError):
    """Raised when the specified Instagram account cannot be found."""
    pass


class InstagramUnavailableError(InstagramProviderError):
    """Raised when Meta servers return 5xx errors or service downtime."""
    pass


class ContentNormalizationError(InstagramProviderError):
    """Raised when media format or types cannot be normalized to canonical types."""
    pass


class TransientProviderError(InstagramProviderError):
    """Raised on network timeouts or temporary connection resets."""
    pass


__all__ = [
    "InstagramProviderError",
    "InstagramAPIError",
    "InstagramAuthenticationError",
    "InstagramAuthorizationError",
    "InstagramRateLimitError",
    "InstagramMediaNotFoundError",
    "InstagramAccountNotFoundError",
    "InstagramUnavailableError",
    "ContentNormalizationError",
    "TransientProviderError",
]

