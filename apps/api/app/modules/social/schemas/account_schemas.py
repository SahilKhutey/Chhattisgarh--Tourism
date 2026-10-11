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
    display_name: str | None = None
    external_account_id: str | None = None
    profile_url: str | None = None
    account_type: str = "CREATOR"
    sync_frequency_minutes: int = Field(60, ge=5, le=1440)
    priority: int = Field(50, ge=1, le=100)
    content_types_allowed: list[str] = Field(default_factory=lambda: ["VIDEO", "SHORT", "REEL", "POST"])
    max_items: int = Field(30, ge=1, le=200)
    is_featured: bool = False


class SocialAccountUpdate(BaseModel):
    display_name: str | None = None
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
    display_name: str | None = None
    external_account_id: str | None = None
    profile_url: str | None = None
    account_type: str
    status: str
    sync_status: str | None = None
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
    metadata_json: dict[str, Any] = Field(default_factory=dict)
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


class HandleRegisterRequest(BaseModel):
    creator_id: uuid.UUID
    platform: str
    handle: str = Field(..., min_length=1, max_length=128)
    profile_url: str | None = None
    sync_enabled: bool = False
    display_name: str | None = None
    metadata: dict[str, Any] | None = None


class SyncRequestResponse(BaseModel):
    status: str = "accepted"
    account_id: str
    message: str
    run_id: str | None = None


class SyncStateResponse(BaseModel):
    id: uuid.UUID
    social_account_id: uuid.UUID
    sync_status: str
    sync_enabled: bool
    last_started_at: datetime | None = None
    last_finished_at: datetime | None = None
    last_synced_at: datetime | None = None
    last_successful_sync_at: datetime | None = None
    consecutive_failures: int = 0
    last_error: str | None = None
    last_error_code: str | None = None
    cursor: str | None = None
    etag: str | None = None
    discovered_count: int = 0
    created_count: int = 0
    updated_count: int = 0
    skipped_count: int = 0
    failed_count: int = 0
    items_synced_total: int = 0

    model_config = ConfigDict(from_attributes=True)


class SyncRunResponse(BaseModel):
    id: uuid.UUID
    social_account_id: uuid.UUID
    run_id: str | None = None
    platform: str
    trigger: str
    status: str
    items_discovered: int = 0
    items_created: int = 0
    items_updated: int = 0
    items_skipped: int = 0
    items_failed: int = 0
    items_synced: int = 0
    error_code: str | None = None
    error_message: str | None = None
    metadata_json: dict[str, Any] = Field(default_factory=dict)
    started_at: datetime
    finished_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

