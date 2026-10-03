from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.social.domain.enums import (
    ContentType,
    ContentVisibility,
    CulturalSensitivityLevel,
    LicenseType,
)
from app.modules.social.schemas.creator_schemas import CreatorSummaryResponse


class MediaItemCreate(BaseModel):
    media_type: str = Field(default="IMAGE")
    media_url: str = Field(..., max_length=1000)
    thumbnail_url: str | None = Field(default=None, max_length=1000)
    poster_url: str | None = Field(default=None, max_length=1000)
    duration_seconds: float | None = None
    aspect_ratio: str = Field(default="9:16")
    resolution: str | None = Field(default="1080x1920")
    captions_url: str | None = None
    transcript: str | None = None
    language: str = Field(default="hi")
    sort_order: int = Field(default=0)


class MediaItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    content_id: UUID
    media_type: str
    media_url: str
    thumbnail_url: str | None = None
    poster_url: str | None = None
    duration_seconds: float | None = None
    aspect_ratio: str
    resolution: str | None = None
    captions_url: str | None = None
    transcript: str | None = None
    language: str
    processing_status: str
    sort_order: int


class SocialContentCreateRequest(BaseModel):
    content_type: ContentType = Field(default=ContentType.POST)
    title: str = Field(..., min_length=3, max_length=250)
    caption: str = Field(default="", max_length=5000)
    description: str | None = Field(default=None, max_length=20000)

    # Tourism Entity Graph Links
    district_id: str = Field(default="bastar", max_length=80)
    tourism_zone_id: str | None = Field(default=None, max_length=80)
    place_id: UUID | None = None
    place_slug: str | None = Field(default=None, max_length=150)
    route_id: str | None = Field(default=None, max_length=100)
    experience_id: str | None = Field(default=None, max_length=100)
    festival_name: str | None = Field(default=None, max_length=150)
    latitude: float | None = None
    longitude: float | None = None

    # Template Engine Bridging
    template_id: UUID | None = None
    template_version_id: UUID | None = None
    template_payload: dict[str, Any] = Field(default_factory=dict)

    # Cultural Protection & Taxonomy
    cultural_tags: list[str] = Field(default_factory=list)
    tourism_tags: list[str] = Field(default_factory=list)
    hashtags: list[str] = Field(default_factory=list)
    language: str = Field(default="hi", max_length=10)
    cultural_sensitivity: CulturalSensitivityLevel = Field(
        default=CulturalSensitivityLevel.STANDARD
    )
    license_type: LicenseType = Field(default=LicenseType.ORIGINAL_CREATOR)
    source_attribution: str | None = Field(default=None, max_length=255)
    community_attribution: str | None = Field(default=None, max_length=255)
    has_sacred_consent: bool = Field(default=False)

    # Visibility & Lifecycle
    visibility: ContentVisibility = Field(default=ContentVisibility.PUBLIC)
    is_evergreen: bool = Field(default=False)

    # Media items
    media_items: list[MediaItemCreate] = Field(default_factory=list)


class SocialContentUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=250)
    caption: str | None = Field(default=None, max_length=5000)
    description: str | None = Field(default=None, max_length=20000)
    district_id: str | None = None
    place_id: UUID | None = None
    place_slug: str | None = None
    route_id: str | None = None
    experience_id: str | None = None
    festival_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    cultural_tags: list[str] | None = None
    tourism_tags: list[str] | None = None
    hashtags: list[str] | None = None
    is_evergreen: bool | None = None


class SocialContentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    creator_id: UUID
    creator: CreatorSummaryResponse | None = None
    content_type: str
    title: str
    caption: str
    description: str | None = None
    slug: str

    # Tourism Graph
    district_id: str
    tourism_zone_id: str | None = None
    place_id: UUID | None = None
    place_slug: str | None = None
    route_id: str | None = None
    experience_id: str | None = None
    festival_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None

    # Template Engine Bridging
    template_id: UUID | None = None
    template_version_id: UUID | None = None
    template_payload: dict[str, Any] = Field(default_factory=dict)

    # Cultural & Taxonomy
    cultural_tags: list[str]
    tourism_tags: list[str]
    hashtags: list[str]
    language: str
    cultural_sensitivity: str
    license_type: str
    source_attribution: str | None = None
    community_attribution: str | None = None
    has_sacred_consent: bool

    # Lifecycle & Publishing
    visibility: str
    moderation_status: str
    publication_status: str
    is_evergreen: bool
    published_at: datetime | None = None
    expires_at: datetime | None = None

    # Engagement Counters
    likes_count: int
    comments_count: int
    saves_count: int
    shares_count: int
    trip_adds_count: int
    views_count: int

    # Curated Provider Aggregation
    provider: str | None = None
    provider_content_id: str | None = None
    source_url: str | None = None
    original_platform_action_label: str | None = None
    duration_seconds: int | None = None
    aspect_ratio: str | None = None
    synced_at: datetime | None = None

    media_items: list[MediaItemResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class FeedCardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    creator: CreatorSummaryResponse
    content_type: str
    title: str
    caption: str
    slug: str
    district_id: str
    place_slug: str | None = None
    festival_name: str | None = None
    cultural_tags: list[str]
    tourism_tags: list[str]
    primary_media: MediaItemResponse | None = None
    media_count: int
    likes_count: int
    comments_count: int
    trip_adds_count: int
    shares_count: int
    provider: str | None = None
    source_url: str | None = None
    original_platform_action_label: str | None = None
    duration_seconds: int | None = None
    aspect_ratio: str | None = None
    published_at: datetime | None = None
    expires_at: datetime | None = None
    is_story_expired: bool = False


class AddToTripRequest(BaseModel):
    trip_id: str | None = Field(default=None, max_length=100)
    place_slug: str | None = Field(default=None, max_length=150)


class AddToTripResponse(BaseModel):
    success: bool
    content_id: UUID
    trip_id: str | None
    place_slug: str | None
    trip_adds_count: int
    message: str
