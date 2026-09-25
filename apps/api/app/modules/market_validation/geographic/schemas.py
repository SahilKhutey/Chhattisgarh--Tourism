from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

VALID_REGIONS = {"BASTAR", "SURGUJA", "RAIPUR", "BILASPUR", "DURG"}

VALID_GEO_STATUSES = {"VALIDATED", "PROVISIONAL", "INVALIDATED", "DISPUTED"}

VALID_TOURISMS = {
    "WATERFALL",
    "CULTURE",
    "WILDLIFE",
    "HERITAGE",
    "NATURE",
    "TEMPLE",
    "CRAFT",
    "GENERAL",
}


class GeoDestinationBase(BaseModel):
    region_id: str
    zone_id: str | None = None
    destination_id: str
    destination_name: str
    district: str
    latitude: float | None = Field(default=None, ge=-90.0, le=90.0)
    longitude: float | None = Field(default=None, ge=-180.0, le=180.0)
    tourism_type: str = "GENERAL"
    validation_status: str = "PROVISIONAL"
    evidence_count: int = Field(default=1, ge=0)
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)

    @model_validator(mode="before")
    @classmethod
    def validate_destination(cls, data: dict):
        if isinstance(data, dict):
            status = data.get("validation_status")
            if status and status not in VALID_GEO_STATUSES:
                raise ValueError(f"Invalid validation_status '{status}'. Must be one of {sorted(VALID_GEO_STATUSES)}")
            ttype = data.get("tourism_type")
            if ttype and ttype not in VALID_TOURISMS:
                raise ValueError(f"Invalid tourism_type '{ttype}'. Must be one of {sorted(VALID_TOURISMS)}")
            region = data.get("region_id")
            if region and region not in VALID_REGIONS:
                raise ValueError(f"Invalid region_id '{region}'. Must be one of {sorted(VALID_REGIONS)}")
        return data


class GeoDestinationCreate(GeoDestinationBase):
    pass


class GeoDestinationUpdate(BaseModel):
    region_id: str | None = None
    zone_id: str | None = None
    destination_name: str | None = None
    district: str | None = None
    latitude: float | None = Field(default=None, ge=-90.0, le=90.0)
    longitude: float | None = Field(default=None, ge=-180.0, le=180.0)
    tourism_type: str | None = None
    validation_status: str | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)


class GeoDestinationResponse(GeoDestinationBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GeoDestinationListResponse(BaseModel):
    total: int
    items: list[GeoDestinationResponse]
