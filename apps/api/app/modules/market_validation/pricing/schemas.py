from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class PricingTier(BaseModel):
    name: str
    price: float
    currency: str = "INR"
    unit: str  # per lead, per booking %, per month
    target_type: str  # PROVIDER, CONSUMER
    features: list[str]
    description: str
    is_recommended: bool = False


class PricingTiersCatalog(BaseModel):
    lead_pricing: list[PricingTier]
    commission_pricing: list[PricingTier]
    subscription_pricing: list[PricingTier]
    consumer_pricing: list[PricingTier]


class PricingExperimentCreate(BaseModel):
    revenue_stream_id: str | None = None
    customer_type: str = "PROVIDER"
    experiment_type: str = "LEAD_FEE"
    control_price: float = Field(ge=0.0)
    variant_prices: dict[str, float]
    eligibility_rule: str | None = None
    primary_metric: str = "CONVERSION_RATE"
    secondary_metrics: list[str] | None = None
    status: str = "ACTIVE"


class PricingExperimentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    revenue_stream_id: str | None = None
    customer_type: str
    experiment_type: str
    control_price: float
    variant_prices: dict[str, float]
    eligibility_rule: str | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None
    primary_metric: str
    secondary_metrics: list[str] | None = None
    status: str
    decision: str
    created_at: datetime


class PricingEvaluationResponse(BaseModel):
    experiment_id: str
    experiment_type: str
    sample_size: int
    control_metrics: dict[str, float]
    variant_metrics: dict[str, dict[str, float]]
    elasticity: float | None = None
    recommended_price: float
    confidence_level: float
    recommendation: str
