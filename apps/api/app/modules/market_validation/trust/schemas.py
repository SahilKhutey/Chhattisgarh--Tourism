from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class TrustBreakdown(BaseModel):
    official_source_bonus: float = 0.0
    recent_verification_bonus: float = 0.0
    provider_confirmation_bonus: float = 0.0
    community_confirmation_bonus: float = 0.0
    fresh_media_bonus: float = 0.0
    consistent_sources_bonus: float = 0.0
    contradiction_penalty: float = 0.0
    total_trust_score: float = 0.0


class ContentTrustBase(BaseModel):
    content_entry_id: UUID
    source_count: int = Field(default=0, ge=0)
    verified_sources: int = Field(default=0, ge=0)
    freshness_score: float = Field(default=0.0, ge=0.0, le=100.0)
    contradiction_count: int = Field(default=0, ge=0)
    provider_confirmation: bool = False
    community_confirmation: bool = False


class ContentTrustCreate(ContentTrustBase):
    pass


class ContentTrustUpdate(BaseModel):
    source_count: int | None = None
    verified_sources: int | None = None
    freshness_score: float | None = None
    contradiction_count: int | None = None
    provider_confirmation: bool | None = None
    community_confirmation: bool | None = None


class ContentTrustResponse(ContentTrustBase):
    id: UUID
    trust_score: float
    trust_breakdown: TrustBreakdown | None = None
    last_computed_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
