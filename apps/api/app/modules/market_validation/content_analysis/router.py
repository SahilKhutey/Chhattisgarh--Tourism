from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.content_analysis.schemas import (
    ContentOverviewAnalysis,
    QualityVsPerformanceAnalysis,
    ContentPerformanceResponse,
)
from app.modules.market_validation.content_analysis.service import ContentAnalysisService

router = APIRouter(
    prefix="/content/analysis",
    tags=["market-validation-content-analysis"],
)


@router.get(
    "/overview",
    response_model=ContentOverviewAnalysis,
)
def get_content_overview(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentAnalysisService(db)
    return service.get_overview_analysis()


@router.get(
    "/quality-vs-performance",
    response_model=QualityVsPerformanceAnalysis,
)
def get_quality_vs_performance(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentAnalysisService(db)
    return service.get_quality_vs_performance()


@router.get(
    "/performance",
    response_model=list[ContentPerformanceResponse],
)
def list_content_performance(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentAnalysisService(db)
    return service.list_performances(limit=limit, offset=offset)
