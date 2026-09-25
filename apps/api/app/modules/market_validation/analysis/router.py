from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.analysis.schemas import (
    BaselineCreate,
    BaselineResponse,
    ProblemAnalysisResponse,
    JTBDAnalysisResponse,
    JourneyAnalysisResponse,
    SegmentAnalysisResponse,
    WorkflowFragmentationResponse,
    ResearchDashboardSummary,
)
from app.modules.market_validation.analysis.service import AnalysisService

router = APIRouter(
    prefix="/analysis",
    tags=["market-validation-analysis"],
)

service = AnalysisService()


@router.post(
    "/baselines",
    response_model=BaselineResponse,
    status_code=status.HTTP_201_CREATED,
)
def record_baseline(
    payload: BaselineCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.record_baseline(db, payload)


@router.get(
    "/summary",
    response_model=ResearchDashboardSummary,
)
def get_summary(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_summary(db)


@router.get(
    "/problems",
    response_model=ProblemAnalysisResponse,
)
def get_problems_analysis(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.analyze_problems(db)


@router.get(
    "/jtbd",
    response_model=JTBDAnalysisResponse,
)
def get_jtbd_analysis(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.analyze_jtbd(db)


@router.get(
    "/journeys",
    response_model=JourneyAnalysisResponse,
)
def get_journeys_analysis(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.analyze_journeys(db)


@router.get(
    "/segments",
    response_model=SegmentAnalysisResponse,
)
def get_segments_analysis(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.analyze_segments(db)


@router.get(
    "/workflow-fragmentation",
    response_model=WorkflowFragmentationResponse,
)
def get_workflow_fragmentation_analysis(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.analyze_workflow_fragmentation(db)
