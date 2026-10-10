from __future__ import annotations

from typing import Any


class YouTubeProviderError(RuntimeError):
    """Base error for YouTube provider operations."""

    def __init__(
        self,
        message: str,
        *,
        status_code: int | None = None,
        reason: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.reason = reason
        self.details = details or {}


class YouTubeAPIError(YouTubeProviderError):
    """Raised when the YouTube API returns an error response."""
    pass


class YouTubeAccountNotFoundError(YouTubeProviderError):
    """Raised when a specified channel/handle does not exist."""
    pass


class YouTubeQuotaExceededError(YouTubeProviderError):
    """Raised when the project YouTube Data API quota has been exhausted."""
    pass


class YouTubeAuthenticationError(YouTubeProviderError):
    """Raised when the YouTube API key is invalid or unauthorized."""
    pass


class YouTubeRateLimitError(YouTubeProviderError):
    """Raised when temporary rate limits are exceeded (HTTP 429)."""
    pass


class YouTubeUnavailableError(YouTubeProviderError):
    """Raised when the YouTube API is temporarily unavailable (HTTP 5xx)."""
    pass


class TransientProviderError(YouTubeProviderError):
    """Marker exception for transient failures eligible for retry."""
    pass


__all__ = [
    "YouTubeProviderError",
    "YouTubeAPIError",
    "YouTubeAccountNotFoundError",
    "YouTubeQuotaExceededError",
    "YouTubeAuthenticationError",
    "YouTubeRateLimitError",
    "YouTubeUnavailableError",
    "TransientProviderError",
]
