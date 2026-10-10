from __future__ import annotations

from app.modules.social.providers.youtube.adapter import YouTubeAdapter, YouTubeProvider
from app.modules.social.providers.youtube.classifier import YouTubeContentClassifier
from app.modules.social.providers.youtube.client import YouTubeClient
from app.modules.social.providers.youtube.config import YouTubeConfig
from app.modules.social.providers.youtube.errors import (
    TransientProviderError,
    YouTubeAccountNotFoundError,
    YouTubeAPIError,
    YouTubeAuthenticationError,
    YouTubeProviderError,
    YouTubeQuotaExceededError,
    YouTubeRateLimitError,
    YouTubeUnavailableError,
)
from app.modules.social.providers.youtube.mapper import YouTubeContentMapper
from app.modules.social.providers.youtube.models import (
    YouTubeChannel,
    YouTubePlaylistItem,
    YouTubeVideo,
)
from app.modules.social.providers.youtube.parser import (
    duration_to_seconds,
    parse_youtube_profile,
    youtube_channel_url,
    youtube_video_url,
)

__all__ = [
    "YouTubeClient",
    "YouTubeAdapter",
    "YouTubeProvider",
    "YouTubeContentClassifier",
    "YouTubeContentMapper",
    "YouTubeConfig",
    "YouTubeChannel",
    "YouTubeVideo",
    "YouTubePlaylistItem",
    "parse_youtube_profile",
    "duration_to_seconds",
    "youtube_video_url",
    "youtube_channel_url",
    "YouTubeProviderError",
    "YouTubeAPIError",
    "YouTubeAccountNotFoundError",
    "YouTubeQuotaExceededError",
    "YouTubeAuthenticationError",
    "YouTubeRateLimitError",
    "YouTubeUnavailableError",
    "TransientProviderError",
]
