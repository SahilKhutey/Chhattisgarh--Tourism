from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ObservationCreate(BaseModel):
    experiment_id: str
    participant_id: str
    variant: str
    offer: str | None = None
    observed_action: str
    price: float = Field(ge=0.0, default=0.0)
    committed: bool = False
    paid: bool = False
    outcome: str | None = None
    evidence: str | None = None


class ObservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    experiment_id: str
    participant_id: str
    variant: str
    offer: str | None = None
    observed_action: str
    price: float
    committed: bool
    paid: bool
    outcome: str | None = None
    evidence: str | None = None
    created_at: datetime


class VariantPerformance(BaseModel):
    variant: str
    impressions: int
    actions: int
    commitments: int
    payments: int
    conversion_rate: float
    total_revenue: float
    arpu: float


class BusinessExperimentEvaluation(BaseModel):
    experiment_id: str
    total_observations: int
    variants: dict[str, VariantPerformance]
    winning_variant: str | None = None
    statistical_significance: float
    decision: str  # WINNER_VARIANT, INCONCLUSIVE, CONTROL_SUPERIOR
    decision_rationale: str
