from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.schemas.account_schemas import (
    AdminCreatorRegister,
    SocialAccountAcceptPayload,
    SocialAccountCreate,
    SocialAccountResponse,
    SocialAccountUpdate,
)


class SocialAccountRegisterRequest(BaseModel):
    creator_id: uuid.UUID
    platform: SocialPlatform
    handle: str = Field(..., min_length=1, max_length=128)
    profile_url: str | None = None
    display_name: str | None = None
    account_type: str = "CREATOR"
    sync_frequency_minutes: int = Field(60, ge=5, le=1440)
    priority: int = Field(50, ge=1, le=100)
    content_types_allowed: list[str] = Field(default_factory=lambda: ["VIDEO", "SHORT", "REEL", "POST"])
    max_items: int = Field(30, ge=1, le=200)
    is_featured: bool = False


__all__ = [
    "SocialAccountCreate",
    "SocialAccountRegisterRequest",
    "SocialAccountUpdate",
    "SocialAccountAcceptPayload",
    "SocialAccountResponse",
    "AdminCreatorRegister",
]
