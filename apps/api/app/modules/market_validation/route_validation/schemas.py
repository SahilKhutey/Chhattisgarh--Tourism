from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

VALID_FEASIBILITIES = {"FEASIBLE", "DIFFICULT", "UNREALISTIC", "UNKNOWN"}
VALID_TRAVEL_MODES = {"CAR", "BUS", "BIKE", "TRAIN", "TAXI"}


class RouteValidationBase(BaseModel):
    origin: str
    destination: str
    intermediate_places: list[str] = Field(default_factory=list)
    estimated_duration_minutes: int = Field(ge=5, le=2880)
    actual_or_user_estimate_minutes: int | None = Field(default=None, ge=5, le=2880)
    travel_mode: str = "CAR"
    feasibility: str = "FEASIBLE"
    participant_id: UUID | None = None
    evidence: str | None = None

    @model_validator(mode="before")
    @classmethod
    def validate_route(cls, data: dict):
        if isinstance(data, dict):
            f = data.get("feasibility")
            if f and f not in VALID_FEASIBILITIES:
                raise ValueError(f"Invalid feasibility '{f}'. Must be one of {sorted(VALID_FEASIBILITIES)}")
            m = data.get("travel_mode")
            if m and m not in VALID_TRAVEL_MODES:
                raise ValueError(f"Invalid travel_mode '{m}'. Must be one of {sorted(VALID_TRAVEL_MODES)}")
            orig = data.get("origin")
            dest = data.get("destination")
            if orig and dest and orig.strip().lower() == dest.strip().lower():
                raise ValueError("Route origin and destination cannot be identical.")
        return data


class RouteValidationCreate(RouteValidationBase):
    pass


class RouteValidationResponse(RouteValidationBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RouteValidationListResponse(BaseModel):
    total: int
    items: list[RouteValidationResponse]
