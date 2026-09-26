from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

VALID_ORDER_STATUSES = {
    "INITIATED",
    "CHECKOUT",
    "PAYMENT_PENDING",
    "PAID",
    "FULFILLED",
    "COMPLETED",
    "PAYMENT_FAILED",
    "CANCELLED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
    "DISPUTED",
}


class OfferCreate(BaseModel):
    revenue_stream_id: str | None = None
    target_type: str = "PROVIDER"
    target_id: str | None = None
    offer_title: str
    offer_description: str | None = None
    price: float = Field(default=25.0, ge=0.0)
    currency: str = "INR"
    billing_cycle: str = "ONE_TIME"  # ONE_TIME, MONTHLY, ANNUAL, PER_EVENT
    features: list[str] | None = None
    status: str = "ACTIVE"


class OfferResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    revenue_stream_id: str | None = None
    target_type: str
    target_id: str | None = None
    offer_title: str
    offer_description: str | None = None
    price: float
    currency: str
    billing_cycle: str
    features: list[str] | None = None
    status: str
    created_at: datetime


class OrderCreate(BaseModel):
    offer_id: str
    customer_type: str = "PROVIDER"
    customer_id: str
    amount: float = Field(ge=0.0)
    currency: str = "INR"
    idempotency_key: str | None = None
    variable_cost: float = Field(default=0.0, ge=0.0)
    metadata: dict | None = None


class OrderStatusUpdate(BaseModel):
    status: str
    refund_amount: float | None = None
    refund_reason: str | None = None


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    offer_id: str
    customer_type: str
    customer_id: str
    amount: float
    currency: str
    status: str
    idempotency_key: str | None = None
    variable_cost: float
    contribution_margin: float
    refund_amount: float
    refund_reason: str | None = None
    created_at: datetime
    updated_at: datetime


class MonetizationPolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    revenue_model: str
    eligible_surface: str
    ranking_influence: str
    disclosure_required: bool
    user_impact: str | None = None
    trust_risk: float
    approval_status: str
    approved_by: str | None = None
    created_at: datetime
