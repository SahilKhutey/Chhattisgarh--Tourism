from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ExpansionCandidateCreate(BaseModel):
    current_market_id: str
    candidate_market_id: str
    similarity_score: float = Field(default=0.0, ge=0.0, le=100.0)
    demand_score: float = Field(default=0.0, ge=0.0, le=100.0)
    supply_score: float = Field(default=0.0, ge=0.0, le=100.0)
    geographic_fit: float = Field(default=0.0, ge=0.0, le=100.0)
    operational_fit: float = Field(default=0.0, ge=0.0, le=100.0)
    economic_fit: float = Field(default=0.0, ge=0.0, le=100.0)
    expansion_risk: float = Field(default=0.0, ge=0.0, le=100.0)
    recommendation: str = "RECOMMENDED_NEXT_EXPANSION"


class ExpansionCandidateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    current_market_id: str
    candidate_market_id: str
    similarity_score: float
    demand_score: float
    supply_score: float
    geographic_fit: float
    operational_fit: float
    economic_fit: float
    expansion_risk: float
    composite_expansion_score: float = 0.0
    recommendation: str
    created_at: datetime
