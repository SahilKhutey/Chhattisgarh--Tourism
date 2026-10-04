from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class AcceptanceDecision(StrEnum):
    ACCEPT = "accept"
    REJECT = "reject"
    REQUEST_CHANGES = "request_changes"
    HOLD = "hold"


class RejectionReasonCode(StrEnum):
    INVALID_CREATOR = "INVALID_CREATOR"
    INVALID_ACCOUNT = "INVALID_ACCOUNT"
    NOT_RELEVANT = "NOT_RELEVANT"
    DUPLICATE = "DUPLICATE"
    UNVERIFIABLE = "UNVERIFIABLE"
    CONTENT_POLICY = "CONTENT_POLICY"
    RIGHTS_CONCERN = "RIGHTS_CONCERN"
    REGIONAL_RELEVANCE = "REGIONAL_RELEVANCE"
    OTHER = "OTHER"


@dataclass(frozen=True, slots=True)
class AcceptanceRequest:
    decision: AcceptanceDecision
    reason: str | None = None
    reason_code: RejectionReasonCode | str | None = None


class AcceptanceDecisionPayload(BaseModel):
    decision: AcceptanceDecision
    reason: str | None = None
    reason_code: RejectionReasonCode | str | None = None
    approved_content_types: list[str] | None = None
    priority: int | None = None


class RejectionPayload(BaseModel):
    reason: str = Field(..., min_length=3, description="Detailed explanation for rejection")
    reason_code: RejectionReasonCode = Field(default=RejectionReasonCode.OTHER)


class RequestChangesPayload(BaseModel):
    reason: str = Field(..., min_length=3)
    requested_fields: list[str] = Field(default_factory=list)


__all__ = [
    "AcceptanceDecision",
    "RejectionReasonCode",
    "AcceptanceRequest",
    "AcceptanceDecisionPayload",
    "RejectionPayload",
    "RequestChangesPayload",
]
