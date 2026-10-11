from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass(slots=True)
class InstagramAccountInfo:
    """Canonical representation of an Instagram business/creator account."""
    provider_account_id: str
    username: str
    name: str | None = None
    profile_picture_url: str | None = None
    biography: str | None = None
    followers_count: int = 0
    media_count: int = 0
    raw_metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class InstagramMedia:
    """Canonical representation of an Instagram media item from Meta Graph API."""
    provider_id: str
    media_type: str  # "IMAGE", "VIDEO", "CAROUSEL_ALBUM"
    permalink: str
    media_product_type: str | None = None  # "FEED", "REELS", etc.
    caption: str | None = None
    media_url: str | None = None
    thumbnail_url: str | None = None
    timestamp: datetime | None = None
    username: str | None = None
    raw_metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class AccountCapabilities:
    """Capabilities available for an individual connected Instagram account."""
    can_read_media: bool = False
    can_read_reels: bool = False
    can_read_insights: bool = False
    can_receive_webhooks: bool = False


@dataclass(frozen=True, slots=True)
class InstagramMediaPage:
    """Paginated collection of Instagram media items."""
    items: list[InstagramMedia]
    next_cursor: str | None = None
    has_next: bool = False


__all__ = [
    "InstagramAccountInfo",
    "InstagramMedia",
    "AccountCapabilities",
    "InstagramMediaPage",
]
