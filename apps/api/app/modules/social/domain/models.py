from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from .enums import (
    SocialAccountStatus,
    SocialPlatform,
    SyncStatus,
)


@dataclass(slots=True)
class SocialAccount:
    id: str
    creator_id: str
    platform: SocialPlatform

    profile_url: str
    handle: str

    display_name: str | None = None
    external_account_id: str | None = None

    status: SocialAccountStatus = SocialAccountStatus.PENDING
    sync_status: SyncStatus = SyncStatus.NEVER_RUN

    sync_enabled: bool = False

    last_synced_at: datetime | None = None
    last_successful_sync_at: datetime | None = None
    last_error: str | None = None

    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class SocialContent:
    id: str

    creator_id: str
    social_account_id: str

    platform: SocialPlatform
    provider_content_id: str

    content_type: str

    title: str | None
    description: str | None

    source_url: str
    thumbnail_url: str | None

    published_at: datetime | None
    synced_at: datetime

    status: str
    visibility: str

    district_id: str | None = None
    tourism_zone_id: str | None = None
    place_id: str | None = None

    language: str | None = None

    hashtags: list[str] = field(default_factory=list)
    tourism_tags: list[str] = field(default_factory=list)
    cultural_tags: list[str] = field(default_factory=list)

    metadata: dict[str, Any] = field(default_factory=dict)
