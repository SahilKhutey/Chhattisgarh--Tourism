from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class EvidenceSnapshotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    version: int
    mv1_status: str
    mv2_status: str
    mv3_status: str
    mv4_status: str
    mv5_status: str
    mv6_status: str
    mv7_status: str
    mv8_status: str
    mv9_status: str
    mv10_status: str
    mv11_status: str
    mv12_status: str
    evidence_count: int
    strong_evidence_count: int
    contradictory_evidence_count: int
    consumer_evidence: dict | None = None
    supply_evidence: dict | None = None
    geographic_evidence: dict | None = None
    content_evidence: dict | None = None
    transaction_evidence: dict | None = None
    retention_evidence: dict | None = None
    economic_evidence: dict | None = None
    operational_evidence: dict | None = None
    generated_at: datetime
    generated_by: str


class DecisionCreate(BaseModel):
    decision: str  # GO, CONDITIONAL_GO, CONTINUE_VALIDATION, PIVOT, NO_GO
    rationale: str
    policy_version: str = "1.0.0"
    confidence: str = "HIGH"
    approved_by: str = "EXECUTIVE_COMMITTEE"


class DecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    version: int
    decision: str
    rationale: str
    evidence_snapshot_id: str
    policy_version: str
    gate_snapshot: dict | None = None
    risk_snapshot: dict | None = None
    contradiction_snapshot: list[dict] | None = None
    unknowns_snapshot: list[dict] | None = None
    recommendation_scope: dict | None = None
    confidence: str
    approved_by: str
    decided_at: datetime


class GateEvaluationResult(BaseModel):
    gate_id: str
    gate_name: str
    status: str  # PASS, CONDITIONAL, FAIL, INSUFFICIENT_DATA
    metric: str
    threshold: str
    observed: str
    is_critical: bool


class NinetyDayPlanItem(BaseModel):
    phase: str  # Days 1-30, Days 31-60, Days 61-90
    title: str
    objective: str
    actions: list[str]
    owner: str
    success_metric: str
