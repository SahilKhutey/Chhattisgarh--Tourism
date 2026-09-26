from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

VALID_WTP_RESPONSE_TYPES = {
    "INTERESTED",
    "COMMITTED",
    "PAYMENT_ATTEMPTED",
    "PURCHASED",
    "REJECTED",
}


class WillingnessToPayCreate(BaseModel):
    participant_type: str = "PROVIDER"
    participant_id: str
    offer_id: str | None = None
    price: float = Field(ge=0.0)
    currency: str = "INR"
    response_type: str = "INTERESTED"
    committed: bool = False
    payment_attempted: bool = False
    purchased: bool = False
    rejected_reason: str | None = None
    experiment_id: str | None = None


class WillingnessToPayResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    participant_type: str
    participant_id: str
    offer_id: str | None = None
    price: float
    currency: str
    response_type: str
    committed: bool
    payment_attempted: bool
    purchased: bool
    rejected_reason: str | None = None
    experiment_id: str | None = None
    created_at: datetime


class WillingnessToPaySummary(BaseModel):
    participant_type: str
    total_responses: int
    interested_count: int
    committed_count: int
    payment_attempted_count: int
    purchased_count: int
    rejected_count: int
    commitment_rate: float
    conversion_rate: float
    average_accepted_price: float
    median_accepted_price: float
    currency: str = "INR"


class PriceSensitivityAnalysis(BaseModel):
    participant_type: str
    price_points: list[float]
    too_cheap_price: float
    cheap_good_value_price: float
    expensive_price: float
    too_expensive_price: float
    optimal_price_point: float
    indifference_price_point: float
    recommendation: str
