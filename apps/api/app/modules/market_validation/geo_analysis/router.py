from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.geo_analysis.schemas import (
    NearbyAnalysisResponse,
    RouteAnalysisResponse,
    DiscoveryAnalysisResponse,
    ClusterAnalysisResponse,
    GeographicUtilityResponse,
    RegionalOverviewResponse,
)
from app.modules.market_validation.geo_analysis.service import GeoAnalysisService

router = APIRouter(
    prefix="/analysis",
    tags=["market-validation-geo-analysis"],
)

service = GeoAnalysisService()


@router.get(
    "/nearby",
    response_model=NearbyAnalysisResponse,
)
def get_nearby_analysis(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_nearby_analysis(db)


@router.get(
    "/routes",
    response_model=RouteAnalysisResponse,
)
def get_route_analysis(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_route_analysis(db)


@router.get(
    "/discovery",
    response_model=DiscoveryAnalysisResponse,
)
def get_discovery_analysis(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_discovery_analysis(db)


@router.get(
    "/clusters",
    response_model=ClusterAnalysisResponse,
)
def get_cluster_analysis(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_cluster_analysis(db)


@router.get(
    "/geographic-utility",
    response_model=GeographicUtilityResponse,
)
def get_geographic_utility(
    region_id: str = Query(default="BASTAR"),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_geographic_utility(db, region_id=region_id)


@router.get(
    "/regional-overview",
    response_model=RegionalOverviewResponse,
)
def get_regional_overview(
    region_id: str = Query(default="BASTAR"),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_regional_overview(db, region_id=region_id)
