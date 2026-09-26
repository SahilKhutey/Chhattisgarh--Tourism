from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

COMPLETION_STATUSES = {
    "SCHEDULED",
    "IN_PROGRESS",
    "COMPLETED",
    "NO_SHOW",
    "CANCELLED",
    "DISPUTED",
}

FAILURE_REASONS = {
    "NO_PROVIDER_RESPONSE",
    "NO_AVAILABILITY",
    "PRICE_MISMATCH",
    "TRAVELER_CHANGED_PLAN",
    "TRUST_CONCERN",
    "INFORMATION_MISSING",
    "PAYMENT_FAILURE",
    "PROVIDER_DECLINED",
    "CONSUMER_DECLINED",
    "TECHNICAL_FAILURE",
    "CANCELLATION",
    "OTHER",
}


class TransactionCreate(BaseModel):
    booking_id: str
    provider_id: str
    consumer_id: str | None = None
    gross_amount: float = 0.0
    currency: str = "INR"
    completion_status: str = "SCHEDULED"
    idempotency_key: str | None = None


class TransactionCompleteRequest(BaseModel):
    role: str = "PROVIDER"  # PROVIDER or CONSUMER
    completion_status: str = "COMPLETED"  # COMPLETED, NO_SHOW, CANCELLED, DISPUTED
    failure_reason: str | None = None
    notes: str | None = None


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    transaction_id: str
    booking_id: str
    provider_id: str
    consumer_id: str | None = None
    gross_amount: float
    currency: str
    completion_status: str
    provider_confirmed: bool
    consumer_confirmed: bool
    failure_reason: str | None = None
    idempotency_key: str | None = None
    created_at: datetime
    completed_at: datetime | None = None


class TransactionFeedbackCreate(BaseModel):
    provider_id: str
    consumer_id: str | None = None
    feedback_type: str  # PROVIDER_FEEDBACK, CONSUMER_FEEDBACK
    lead_quality_score: float | None = None
    relevance_score: float | None = None
    operational_effort_score: float | None = None
    economic_value_score: float | None = None
    continuation_intent: bool | None = None
    satisfaction_score: float | None = None
    notes: str | None = None


class TransactionFeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    transaction_id: str
    provider_id: str
    consumer_id: str | None = None
    feedback_type: str
    lead_quality_score: float | None = None
    relevance_score: float | None = None
    operational_effort_score: float | None = None
    economic_value_score: float | None = None
    continuation_intent: bool | None = None
    satisfaction_score: float | None = None
    notes: str | None = None
    created_at: datetime
