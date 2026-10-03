from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Protocol, runtime_checkable

from app.modules.social.domain.enums import ContentType, SocialContentType, SocialPlatform
from app.modules.social.domain.models import SocialContent


@dataclass(frozen=True, slots=True)
class ProviderAccount:
    external_id: str
    handle: str
    display_name: str | None
    profile_url: str


@dataclass(frozen=True, slots=True)
class ProviderContent:
    external_id: str
    content_type: SocialContentType

    title: str | None
    description: str | None

    source_url: str
    thumbnail_url: str | None

    published_at: datetime | None


@runtime_checkable
class SocialProvider(Protocol):
    platform: SocialPlatform

    def verify_account(
        self,
        profile_url: str,
    ) -> Any:
        ...

    def fetch_content(
        self,
        account: Any,
        *,
        cursor: str | None = None,
        limit: int = 20,
    ) -> Any:
        ...


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
