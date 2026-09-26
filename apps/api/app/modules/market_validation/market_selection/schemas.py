from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class MarketCandidateCreate(BaseModel):
    geography_id: str
    demand_score: float = Field(default=0.0, ge=0.0, le=100.0)
    supply_score: float = Field(default=0.0, ge=0.0, le=100.0)
    content_score: float = Field(default=0.0, ge=0.0, le=100.0)
    geographic_score: float = Field(default=0.0, ge=0.0, le=100.0)
    accessibility_score: float = Field(default=0.0, ge=0.0, le=100.0)
    operational_score: float = Field(default=0.0, ge=0.0, le=100.0)
    risk_score: float = Field(default=0.0, ge=0.0, le=100.0)
    evidence_strength: str = "MODERATE"
    evidence_ids: list[str] = Field(default_factory=list)


class MarketCandidateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    geography_id: str
    demand_score: float
    supply_score: float
    content_score: float
    geographic_score: float
    accessibility_score: float
    operational_score: float
    risk_score: float
    evidence_strength: str
    pilot_priority: int
    recommendation: str
    evidence_ids: list[str] | None = None
    composite_score: float = 0.0
    created_at: datetime
