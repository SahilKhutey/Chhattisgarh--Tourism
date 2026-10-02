from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CreatorRegisterRequest(BaseModel):
    handle: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_.]+$")
    display_name: str = Field(..., min_length=2, max_length=120)
    bio: str | None = Field(default=None, max_length=1000)
    avatar_url: str | None = Field(default=None, max_length=500)
    district_id: str = Field(default="bastar", min_length=2, max_length=80)
    languages: list[str] = Field(default_factory=lambda: ["cg", "hi"])
    categories: list[str] = Field(default_factory=lambda: ["Culture", "Travel"])


class CreatorUpdateRequest(BaseModel):
    display_name: str | None = Field(default=None, min_length=2, max_length=120)
    bio: str | None = Field(default=None, max_length=1000)
    avatar_url: str | None = Field(default=None, max_length=500)
    district_id: str | None = Field(default=None, min_length=2, max_length=80)
    languages: list[str] | None = None
    categories: list[str] | None = None
    featured_work_id: UUID | None = None


class CreatorSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    handle: str
    display_name: str
    avatar_url: str | None = None
    district_id: str
    is_verified: bool


class CreatorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    handle: str
    display_name: str
    bio: str | None = None
    avatar_url: str | None = None
    district_id: str
    languages: list[str]
    categories: list[str]
    status: str
    is_verified: bool
    followers_count: int
    following_count: int
    posts_count: int
    featured_work_id: UUID | None = None
    created_at: datetime
    updated_at: datetime
