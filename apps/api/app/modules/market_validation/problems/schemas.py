from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

VALID_JOURNEY_STAGES = {
    "DISCOVERY",
    "EVALUATION",
    "DECISION",
    "PLANNING",
    "TRAVEL",
    "EXPERIENCE",
    "BOOKING",
    "SHARING",
    "REVIEW",
    "RETURN",
}

VALID_EVIDENCE_STRENGTHS = {
    "DIRECT_BEHAVIOR",
    "OBSERVED_WORKAROUND",
    "REPORTED_PAIN",
    "USER_STATEMENT",
    "REPORTED_DESIRE",
    "RESEARCHER_INFERENCE",
}

VALID_PROBLEM_STATUSES = {
    "UNTESTED",
    "EMERGING",
    "SUPPORTED",
    "STRONGLY_SUPPORTED",
    "INCONCLUSIVE",
    "INVALIDATED",
}


class ProblemBase(BaseModel):
    participant_id: UUID | None = None
    interview_id: UUID | None = None
    journey_stage: str
    problem_statement: str
    current_behavior: str
    workaround: str
    frequency: int = Field(ge=1, le=5, default=3)
    severity: int = Field(ge=1, le=5, default=3)
    emotional_cost: int = Field(ge=1, le=5, default=3)
    financial_cost: int = Field(ge=1, le=5, default=1)
    time_cost: int = Field(ge=1, le=5, default=3)
    trust_impact: int = Field(ge=1, le=5, default=3)
    evidence_strength: str = "REPORTED_PAIN"
    affected_segment: str | None = None
    affected_geography: str | None = None
    related_jtbd: str | None = None
    cluster_tag: str | None = None
    status: str = "UNTESTED"

    @model_validator(mode="before")
    @classmethod
    def validate_problem_fields(cls, data: dict):
        if not isinstance(data, dict):
            return data
        stage = data.get("journey_stage")
        if not stage or stage not in VALID_JOURNEY_STAGES:
            raise ValueError(f"Invalid journey_stage '{stage}'. Must be one of {sorted(VALID_JOURNEY_STAGES)}")
        strength = data.get("evidence_strength", "REPORTED_PAIN")
        if strength not in VALID_EVIDENCE_STRENGTHS:
            raise ValueError(f"Invalid evidence_strength '{strength}'. Must be one of {sorted(VALID_EVIDENCE_STRENGTHS)}")
        p_status = data.get("status", "UNTESTED")
        if p_status not in VALID_PROBLEM_STATUSES:
            raise ValueError(f"Invalid status '{p_status}'. Must be one of {sorted(VALID_PROBLEM_STATUSES)}")
        return data


class ProblemCreate(ProblemBase):
    pass


class ProblemUpdate(BaseModel):
    journey_stage: str | None = None
    problem_statement: str | None = None
    current_behavior: str | None = None
    workaround: str | None = None
    frequency: int | None = Field(default=None, ge=1, le=5)
    severity: int | None = Field(default=None, ge=1, le=5)
    emotional_cost: int | None = Field(default=None, ge=1, le=5)
    financial_cost: int | None = Field(default=None, ge=1, le=5)
    time_cost: int | None = Field(default=None, ge=1, le=5)
    trust_impact: int | None = Field(default=None, ge=1, le=5)
    evidence_strength: str | None = None
    affected_segment: str | None = None
    affected_geography: str | None = None
    related_jtbd: str | None = None
    cluster_tag: str | None = None
    status: str | None = None

    @model_validator(mode="before")
    @classmethod
    def validate_updates(cls, data: dict):
        if not isinstance(data, dict):
            return data
        stage = data.get("journey_stage")
        if stage is not None and stage not in VALID_JOURNEY_STAGES:
            raise ValueError(f"Invalid journey_stage '{stage}'.")
        strength = data.get("evidence_strength")
        if strength is not None and strength not in VALID_EVIDENCE_STRENGTHS:
            raise ValueError(f"Invalid evidence_strength '{strength}'.")
        p_status = data.get("status")
        if p_status is not None and p_status not in VALID_PROBLEM_STATUSES:
            raise ValueError(f"Invalid status '{p_status}'.")
        return data


class ProblemResponse(ProblemBase):
    id: UUID
    pain_score: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProblemListResponse(BaseModel):
    total: int
    items: list[ProblemResponse]
