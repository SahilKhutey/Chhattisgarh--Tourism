from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

VALID_CUSTOMER_TYPES = {
    "CONSUMER",
    "PROVIDER",
    "CREATOR",
    "GOVERNMENT",
    "INSTITUTION",
    "PARTNER",
}

VALID_REVENUE_MODELS = {
    "SUBSCRIPTION",
    "COMMISSION",
    "LEAD_FEE",
    "TRANSACTION_FEE",
    "PREMIUM",
    "SPONSORSHIP",
    "ADVERTISING",
    "DATA_SERVICE",
    "LICENSING",
    "SERVICE_CONTRACT",
    "FREE_DISCOVERY",
    "INSTITUTIONAL_SAAS",
}

VALID_HYPOTHESIS_STATUSES = {
    "UNTESTED",
    "EMERGING",
    "SUPPORTED",
    "STRONGLY_SUPPORTED",
    "INCONCLUSIVE",
    "INVALIDATED",
}


class BusinessModelCreate(BaseModel):
    name: str
    customer_type: str = "PROVIDER"
    value_proposition: str
    revenue_model: str = "LEAD_FEE"
    pricing_model: str | None = None
    payment_trigger: str | None = None
    cost_structure: str | None = None
    assumptions: list[str] | None = None
    status: str = "EMERGING"
    evidence_strength: str = "MODERATE"


class BusinessModelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    customer_type: str
    value_proposition: str
    revenue_model: str
    pricing_model: str | None = None
    payment_trigger: str | None = None
    cost_structure: str | None = None
    assumptions: list[str] | None = None
    status: str
    evidence_strength: str
    created_at: datetime
    updated_at: datetime


class RevenueStreamCreate(BaseModel):
    business_model_id: str | None = None
    customer_type: str = "PROVIDER"
    stream_type: str = "QUALIFIED_LEAD_FEE"
    description: str
    value_created: str | None = None
    payment_trigger: str | None = "LEAD_DELIVERY"
    pricing_unit: str = "per qualified lead"
    base_price: float = Field(default=25.0, ge=0.0)
    currency: str = "INR"
    estimated_frequency: str | None = "Monthly recurring"
    estimated_conversion: float = Field(default=0.15, ge=0.0, le=1.0)
    estimated_margin: float = Field(default=0.65, ge=0.0, le=1.0)
    status: str = "ACTIVE"
    evidence_strength: str = "SUPPORTED"


class RevenueStreamResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    business_model_id: str | None = None
    customer_type: str
    stream_type: str
    description: str
    value_created: str | None = None
    payment_trigger: str | None = None
    pricing_unit: str
    base_price: float
    currency: str
    estimated_frequency: str | None = None
    estimated_conversion: float
    estimated_margin: float
    status: str
    evidence_strength: str
    created_at: datetime
    updated_at: datetime


class MonetizationHypothesis(BaseModel):
    id: str  # H-MV9-001 ... H-MV9-010
    statement: str
    target_side: str
    status: str
    evidence_source: str
    observation: str
    confidence: float  # 0.0 - 1.0


class CanvasSectionItem(BaseModel):
    title: str
    description: str
    evidence: str
    status: str


class BusinessModelCanvasResponse(BaseModel):
    status: str = "COMPILED"
    business_models: list[BusinessModelResponse] = []
    revenue_streams: list[RevenueStreamResponse] = []
    customer_segments: list[CanvasSectionItem]
    value_propositions: list[CanvasSectionItem]
    channels: list[CanvasSectionItem]
    customer_relationships: list[CanvasSectionItem]
    key_resources: list[CanvasSectionItem]
    key_activities: list[CanvasSectionItem]
    key_partners: list[CanvasSectionItem]
    cost_structure: list[CanvasSectionItem]
    hypotheses: list[MonetizationHypothesis]


BusinessModelCanvas = BusinessModelCanvasResponse
