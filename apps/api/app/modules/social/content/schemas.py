from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.modules.social.domain.enums import (
    ContentStatus,
    ContentType,
    ContentVisibility,
    CulturalSensitivityLevel,
    LicenseType,
    ModerationStatus,
    SocialPlatform,
)
from app.modules.social.schemas.content_schemas import (
    MediaItemCreate,
    MediaItemResponse,
    SocialContentCreateRequest,
    SocialContentResponse,
    SocialContentUpdateRequest,
)


class SocialContentSyncInput(BaseModel):
    creator_id: uuid.UUID
    social_account_id: uuid.UUID
    platform: SocialPlatform
    provider_content_id: str
    content_type: ContentType
    title: str
    description: str | None = None
    source_url: str
    thumbnail_url: str | None = None
    published_at: datetime | None = None
    duration_seconds: int | None = None
    aspect_ratio: str | None = "16:9"
    view_count: int = 0
    like_count: int = 0
    tags: list[str] = Field(default_factory=list)


__all__ = [
    "MediaItemCreate",
    "MediaItemResponse",
    "SocialContentCreateRequest",
    "SocialContentUpdateRequest",
    "SocialContentResponse",
    "SocialContentSyncInput",
]
