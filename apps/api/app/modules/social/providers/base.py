from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Protocol, runtime_checkable

from app.modules.social.domain.enums import ContentType, SocialPlatform


@dataclass
class SocialAccountProfile:
    handle: str
    display_name: str
    profile_image_url: str | None = None
    bio: str | None = None
    provider_channel_id: str | None = None
    follower_or_subscriber_count: int = 0
    is_valid: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class NormalizedSocialItem:
    provider: SocialPlatform
    provider_content_id: str
    content_type: ContentType
    title: str
    description: str | None
    source_url: str
    thumbnail_url: str | None
    published_at: datetime
    duration_seconds: int | None = None
    aspect_ratio: str = "16:9"
    view_count: int = 0
    like_count: int = 0
    hashtags: list[str] = field(default_factory=list)
    raw_metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class SyncResult:
    items: list[NormalizedSocialItem]
    next_cursor: str | None = None
    has_more: bool = False


@runtime_checkable
class SocialProvider(Protocol):
    def verify_account(self, handle_or_url: str) -> SocialAccountProfile:
        """Verifies if the social handle or channel exists on the platform."""
        ...

    def fetch_content(
        self,
        handle: str,
        cursor: str | None = None,
        limit: int = 20,
    ) -> SyncResult:
        """Fetches and normalizes latest posts, reels, or videos from the platform."""
        ...
