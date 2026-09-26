from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class UnitEconomicsInput(BaseModel):
    segment: str = "PROVIDER"  # PROVIDER, CONSUMER
    period: str = "PILOT-1"
    spend: float = Field(ge=0.0)
    acquired_users: int = Field(ge=1)
    activated_users: int = Field(ge=0)
    paying_users: int = Field(ge=0)
    revenue: float = Field(ge=0.0)
    variable_costs: float = Field(ge=0.0, default=0.0)
    expected_lifespan_cycles: float = Field(gt=0.0, default=12.0)  # 12 months for providers, 2.5 cycles for travelers


class UnitEconomicsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    segment: str
    period: str
    spend: float
    acquired_users: int
    activated_users: int
    paying_users: int
    cac: float
    activated_cac: float
    arpu: float
    variable_cost_per_user: float
    contribution_margin: float
    expected_lifespan_cycles: float
    ltv: float
    ltv_cac_ratio: float
    payback_period_months: float
    created_at: datetime
    updated_at: datetime


class UnitEconomicsOverview(BaseModel):
    records: list[UnitEconomicsResponse]
    blended_ltv_cac: float
    is_economically_viable: bool
    viability_rationale: str
