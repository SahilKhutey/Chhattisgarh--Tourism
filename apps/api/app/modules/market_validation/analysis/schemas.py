from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class BaselineCreate(BaseModel):
    participant_id: UUID
    task_id: str = "TASK_BASTAR_3DAY_PLAN"
    completion_status: str = "COMPLETED"
    duration_seconds: int = Field(ge=1)
    tools_used: list[str] = Field(default_factory=list)
    searches_count: int = 0
    manual_steps: int = 0
    unresolved_questions: list[str] | None = None
    confidence_score: int = Field(ge=1, le=5, default=3)
    researcher_notes: str | None = None


class BaselineResponse(BaselineCreate):
    id: UUID
    workflow_fragmentation_score: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProblemAnalysisItem(BaseModel):
    cluster_tag: str
    problem_count: int
    avg_pain_score: float
    max_pain_score: int
    top_problem_statement: str


class ProblemAnalysisResponse(BaseModel):
    total_problems: int
    clusters: list[ProblemAnalysisItem]


class JTBDAnalysisItem(BaseModel):
    jtbd_key: str
    title: str
    status: str
    confidence_score: float
    supporting_interviews: int
    total_evaluated: int


class JTBDAnalysisResponse(BaseModel):
    items: list[JTBDAnalysisItem]


class JourneyStageAnalysisItem(BaseModel):
    journey_stage: str
    problem_count: int
    avg_pain_score: float


class JourneyAnalysisResponse(BaseModel):
    stages: list[JourneyStageAnalysisItem]


class SegmentAnalysisItem(BaseModel):
    segment: str
    participant_count: int
    problem_count: int


class SegmentAnalysisResponse(BaseModel):
    segments: list[SegmentAnalysisItem]


class WorkflowFragmentationResponse(BaseModel):
    total_baselines: int
    avg_tools_used: float
    avg_duration_minutes: float
    avg_searches: float
    most_fragmented_task: str
    tools_frequency: dict[str, int]


class ResearchDashboardSummary(BaseModel):
    participants_count: int
    interviews_count: int
    problems_count: int
    strongest_problem: str
    highest_pain_cluster: str
    most_fragmented_workflow: str
    journey_distribution: dict[str, int]
    validated_jtbds: list[dict[str, str]]
