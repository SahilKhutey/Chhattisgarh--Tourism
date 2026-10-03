from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.modules.social.domain.enums import (
    SocialAccountStatus,
    SocialPlatform,
    SyncHealthStatus,
)


class SocialAccountCreate(BaseModel):
    platform: SocialPlatform
    handle: str = Field(..., min_length=2, max_length=128)
    profile_url: str | None = None
    account_type: str = "CREATOR"
    sync_frequency_minutes: int = Field(60, ge=5, le=1440)
    priority: int = Field(50, ge=1, le=100)
    content_types_allowed: list[str] = Field(default_factory=lambda: ["VIDEO", "SHORT", "REEL", "POST"])
    max_items: int = Field(30, ge=1, le=200)
    is_featured: bool = False


class SocialAccountUpdate(BaseModel):
    is_sync_enabled: bool | None = None
    sync_frequency_minutes: int | None = None
    priority: int | None = None
    content_types_allowed: list[str] | None = None
    max_items: int | None = None
    is_featured: bool | None = None


class SocialAccountAcceptPayload(BaseModel):
    approved_content_types: list[str] | None = None
    max_items: int | None = None
    priority: int | None = None


class SocialAccountResponse(BaseModel):
    id: uuid.UUID
    creator_id: uuid.UUID
    platform: str
    handle: str
    profile_url: str | None = None
    account_type: str
    status: str
    is_sync_enabled: bool
    sync_frequency_minutes: int
    priority: int
    content_types_allowed: list[str]
    max_items: int
    is_featured: bool
    sync_health: str
    last_successful_sync: datetime | None = None
    last_attempted_sync: datetime | None = None
    last_error: str | None = None
    consecutive_failures: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminCreatorRegister(BaseModel):
    handle: str = Field(..., min_length=2, max_length=50)
    display_name: str = Field(..., min_length=2, max_length=120)
    bio: str | None = None
    avatar_url: str | None = None
    district_id: str | None = "bastar"
    languages: list[str] = Field(default_factory=lambda: ["hi", "en", "cg"])
    categories: list[str] = Field(default_factory=list)
    social_accounts: list[SocialAccountCreate] = Field(default_factory=list)
