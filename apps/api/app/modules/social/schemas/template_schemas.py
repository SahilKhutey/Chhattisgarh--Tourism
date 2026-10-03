from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.modules.social.domain.enums import FeedLayoutType


class FeedTemplateCreate(BaseModel):
    slug: str = Field(..., min_length=2, max_length=128)
    name: str = Field(..., min_length=2, max_length=256)
    description: str | None = None
    layout: FeedLayoutType = FeedLayoutType.STANDARD_GRID
    is_active: bool = True
    platforms_allowed: list[str] = Field(default_factory=lambda: ["YOUTUBE", "INSTAGRAM"])
    content_types_allowed: list[str] = Field(default_factory=lambda: ["REEL", "SHORT", "VIDEO", "POST"])
    districts_allowed: list[str] = Field(default_factory=list)
    categories_allowed: list[str] = Field(default_factory=list)
    place_slugs_allowed: list[str] = Field(default_factory=list)
    max_items: int = Field(12, ge=1, le=100)
    columns_desktop: int = Field(4, ge=1, le=6)
    columns_tablet: int = Field(3, ge=1, le=4)
    columns_mobile: int = Field(2, ge=1, le=2)
    show_creator_info: bool = True
    show_location: bool = True
    show_date: bool = True
    sort_strategy: str = "LATEST"


class FeedTemplateResponse(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    description: str | None = None
    layout: str
    is_active: bool
    platforms_allowed: list[str]
    content_types_allowed: list[str]
    districts_allowed: list[str]
    categories_allowed: list[str]
    place_slugs_allowed: list[str]
    max_items: int
    columns_desktop: int
    columns_tablet: int
    columns_mobile: int
    show_creator_info: bool
    show_location: bool
    show_date: bool
    sort_strategy: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
