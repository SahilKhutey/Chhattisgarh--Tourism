from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

VALID_CONTENT_TYPES = {
    "DESTINATION",
    "PLACE",
    "EXPERIENCE",
    "FESTIVAL",
    "CULTURAL_STORY",
    "FOOD",
    "ACCOMMODATION",
    "ROUTE",
}

VALID_GOVERNANCE_STATUSES = {
    "CONTENT_DRAFT",
    "CONTENT_REVIEW",
    "CONTENT_VERIFIED",
    "CONTENT_PUBLISHED",
    "CONTENT_STALE",
    "CONTENT_ARCHIVED",
}


class QualityBreakdown(BaseModel):
    completeness: float = 0.0
    accuracy: float = 0.0
    freshness: float = 0.0
    geographic_context: float = 0.0
    practical_utility: float = 0.0
    trust: float = 0.0
    localization: float = 0.0
    total: float = 0.0


class ContentEntryBase(BaseModel):
    content_id: str
    content_type: str
    title: str
    category: str
    destination_id: str | None = None
    short_description: str
    long_description: str | None = None
    language: str = "en"
    fields_json: dict | None = None
    governance_status: str = "CONTENT_DRAFT"
    last_verified_at: datetime | None = None
    next_review_at: datetime | None = None

    @model_validator(mode="before")
    @classmethod
    def validate_content(cls, data: dict):
        if isinstance(data, dict):
            ctype = data.get("content_type")
            if ctype and ctype not in VALID_CONTENT_TYPES:
                raise ValueError(f"Invalid content_type '{ctype}'. Must be one of {sorted(VALID_CONTENT_TYPES)}")
            gstatus = data.get("governance_status")
            if gstatus and gstatus not in VALID_GOVERNANCE_STATUSES:
                raise ValueError(f"Invalid governance_status '{gstatus}'. Must be one of {sorted(VALID_GOVERNANCE_STATUSES)}")
        return data


class ContentEntryCreate(ContentEntryBase):
    pass


class ContentEntryUpdate(BaseModel):
    title: str | None = None
    category: str | None = None
    short_description: str | None = None
    long_description: str | None = None
    language: str | None = None
    fields_json: dict | None = None
    governance_status: str | None = None
    last_verified_at: datetime | None = None
    next_review_at: datetime | None = None


class ContentEntryResponse(ContentEntryBase):
    id: UUID
    quality_score: float
    quality_breakdown: QualityBreakdown | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContentEntryListResponse(BaseModel):
    total: int
    items: list[ContentEntryResponse]
