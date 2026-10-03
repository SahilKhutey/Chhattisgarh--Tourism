from __future__ import annotations

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class CreatorCreate(BaseModel):
    handle: str = Field(..., min_length=2, max_length=50)
    display_name: str = Field(..., min_length=2, max_length=120)
    bio: str | None = None
    avatar_url: str | None = None
    district_id: str = Field(default="bastar", max_length=80)
    tourism_zone_id: str | None = None
    languages: list[str] = Field(default_factory=lambda: ["cg", "hi"])
    categories: list[str] = Field(default_factory=lambda: ["Culture", "Travel"])
    is_featured: bool = False


class CreatorUpdate(BaseModel):
    display_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    district_id: str | None = None
    tourism_zone_id: str | None = None
    languages: list[str] | None = None
    categories: list[str] | None = None
    is_featured: bool | None = None


class CreatorResponse(BaseModel):
    id: uuid.UUID
    handle: str
    display_name: str
    bio: str | None = None
    avatar_url: str | None = None
    district_id: str
    tourism_zone_id: str | None = None
    languages: list[str]
    categories: list[str]
    status: str
    is_verified: bool
    is_featured: bool = False
    followers_count: int
    following_count: int
    posts_count: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
