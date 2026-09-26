from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

CONTENT_HYPOTHESES = {
    "H-MV5-001": "Structured destination content improves destination comprehension.",
    "H-MV5-002": "Contextual geographic content increases destination discovery.",
    "H-MV5-003": "Practical information reduces uncertainty.",
    "H-MV5-004": "Cultural context increases destination interest.",
    "H-MV5-005": "Trust indicators increase willingness to plan.",
    "H-MV5-006": "High-quality visual media increases discovery engagement.",
    "H-MV5-007": "Multilingual content improves comprehension for non-English users.",
    "H-MV5-008": "Creator/local content improves perceived authenticity.",
    "H-MV5-009": "Content freshness affects traveler trust.",
    "H-MV5-010": "Content + geography produces stronger planning behavior than either alone.",
}

VALID_EXPERIMENT_STATUSES = {"DRAFT", "RUNNING", "PAUSED", "COMPLETED", "INVALIDATED"}


class ContentExperimentBase(BaseModel):
    experiment_key: str
    name: str
    hypothesis_key: str
    content_entry_id: str | None = None
    status: str = "DRAFT"
    control_version: dict
    variant_version: dict
    audience: str = "ALL_TRAVELERS"
    primary_metric: str
    secondary_metrics: dict | None = None
    control_metric_value: float = 0.0
    variant_metric_value: float = 0.0
    sample_size_control: int = Field(default=0, ge=0)
    sample_size_variant: int = Field(default=0, ge=0)
    outcome: str | None = None

    @model_validator(mode="before")
    @classmethod
    def validate_experiment(cls, data: dict):
        if isinstance(data, dict):
            status = data.get("status")
            if status and status not in VALID_EXPERIMENT_STATUSES:
                raise ValueError(f"Invalid status '{status}'. Must be one of {sorted(VALID_EXPERIMENT_STATUSES)}")
            hkey = data.get("hypothesis_key")
            if hkey and hkey not in CONTENT_HYPOTHESES:
                raise ValueError(f"Invalid hypothesis_key '{hkey}'. Must be one of {sorted(CONTENT_HYPOTHESES.keys())}")
        return data


class ContentExperimentCreate(ContentExperimentBase):
    pass


class ContentExperimentUpdate(BaseModel):
    name: str | None = None
    status: str | None = None
    control_metric_value: float | None = None
    variant_metric_value: float | None = None
    sample_size_control: int | None = None
    sample_size_variant: int | None = None
    outcome: str | None = None


class ContentExperimentResponse(ContentExperimentBase):
    id: UUID
    lift_percentage: float = 0.0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContentExperimentListResponse(BaseModel):
    total: int
    items: list[ContentExperimentResponse]


class AssignmentRequest(BaseModel):
    anonymous_user_id: str


class AssignmentResponse(BaseModel):
    experiment_id: UUID
    experiment_key: str
    anonymous_user_id: str
    assigned_variant: str  # CONTROL or VARIANT
    assigned_content: dict
    assigned_at: datetime
