from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass(frozen=True, slots=True)
class YouTubeChannel:
    channel_id: str
    handle: str | None
    title: str
    description: str | None
    thumbnail_url: str | None
    uploads_playlist_id: str | None
    custom_url: str | None = None
    subscriber_count: int = 0
    video_count: int = 0
    raw_metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class YouTubePlaylistItem:
    video_id: str
    title: str
    description: str | None
    published_at: datetime | None
    thumbnail_url: str | None
    raw_item: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class YouTubeVideo:
    id: str
    title: str
    description: str | None
    published_at: datetime | None
    duration_seconds: int
    duration_iso: str
    aspect_ratio: str
    thumbnail_url: str | None
    privacy_status: str  # public, unlisted, private
    upload_status: str   # processed, uploaded, rejected, failed, deleted
    embeddable: bool
    channel_id: str
    channel_title: str | None
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    tags: list[str] = field(default_factory=list)
    raw_video: dict[str, Any] = field(default_factory=dict)


__all__ = ["YouTubeChannel", "YouTubePlaylistItem", "YouTubeVideo"]
