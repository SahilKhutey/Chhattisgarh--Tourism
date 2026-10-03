from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Any

from app.modules.social.domain.enums import ContentType, FeedType, SocialPlatform


@dataclass(frozen=True, slots=True)
class FeedQuery:
    feed_type: FeedType = FeedType.HOME
    district_id: str | None = None
    tourism_zone_id: str | None = None
    content_type: ContentType | None = None
    cultural_tag: str | None = None
    tourism_tag: str | None = None
    place_slug: str | None = None
    creator_id: uuid.UUID | None = None
    platform: SocialPlatform | None = None
    limit: int = 30
    offset: int = 0
    enable_diversity: bool = True


__all__ = ["FeedQuery"]
