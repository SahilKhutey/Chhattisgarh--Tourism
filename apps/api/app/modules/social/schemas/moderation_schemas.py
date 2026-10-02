from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.social.domain.enums import ModerationDecision


class ModerationReviewRequest(BaseModel):
    decision: ModerationDecision = Field(..., description="APPROVE, REJECT, REQUEST_CHANGES, or ESCALATE")
    reason: str = Field(..., min_length=2, max_length=1000)
    cultural_notes: str | None = Field(default=None, max_length=2000)


class ModerationLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    content_id: UUID
    moderator_id: UUID
    decision: str
    reason: str
    cultural_notes: str | None = None
    created_at: datetime


class ModerationQueueItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    content_id: UUID
    creator_id: UUID
    creator_handle: str
    title: str
    content_type: str
    district_id: str
    cultural_sensitivity: str
    license_type: str
    has_sacred_consent: bool
    community_attribution: str | None = None
    media_count: int
    created_at: datetime
