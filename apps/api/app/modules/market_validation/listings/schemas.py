from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator


VALID_LISTING_STATUSES = {"DRAFT", "IN_REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED"}


class ListingBase(BaseModel):
    template_id: str | None = None
    status: str = "DRAFT"
    information_score: int = Field(default=0, ge=0, le=100)
    media_score: int = Field(default=0, ge=0, le=100)
    location_score: int = Field(default=0, ge=0, le=100)
    service_score: int = Field(default=0, ge=0, le=100)
    contact_score: int = Field(default=0, ge=0, le=100)
    trust_score: int = Field(default=0, ge=0, le=100)

    @model_validator(mode="before")
    @classmethod
    def validate_listing(cls, data: dict):
        if isinstance(data, dict):
            status = data.get("status")
            if status and status not in VALID_LISTING_STATUSES:
                raise ValueError(f"Invalid status '{status}'. Must be one of {sorted(VALID_LISTING_STATUSES)}")
        return data


class ListingCreate(ListingBase):
    provider_id: UUID


class ListingUpdate(BaseModel):
    template_id: str | None = None
    status: str | None = None
    information_score: int | None = Field(default=None, ge=0, le=100)
    media_score: int | None = Field(default=None, ge=0, le=100)
    location_score: int | None = Field(default=None, ge=0, le=100)
    service_score: int | None = Field(default=None, ge=0, le=100)
    contact_score: int | None = Field(default=None, ge=0, le=100)
    trust_score: int | None = Field(default=None, ge=0, le=100)


class ListingResponse(ListingBase):
    id: UUID
    provider_id: UUID
    listing_quality_score: int
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ListingListResponse(BaseModel):
    total: int
    items: list[ListingResponse]
