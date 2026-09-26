from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.market_validation.auth import require_market_researcher
from app.modules.admin.dependencies import AdminUser

from app.modules.market_validation.retention.schemas import (
    MeaningfulActionRecord,
    ConsumerRetentionResponse,
    TripCycleMetrics,
    NextTripMetrics,
    RetentionOverview,
)
from app.modules.market_validation.retention.service import ConsumerRetentionService
from app.modules.market_validation.cohorts.schemas import (
    CohortCreate,
    CohortUpdateMetrics,
    CohortResponse,
    CohortListResponse,
)
from app.modules.market_validation.cohorts.service import CohortService
from app.modules.market_validation.referrals.schemas import (
    ReferralCreate,
    ReferralActivateRequest,
    ReferralResponse,
    ReferralStatusResponse,
    ReferralFunnelMetrics,
)
from app.modules.market_validation.referrals.service import ReferralService
from app.modules.market_validation.reviews.schemas import (
    ReviewValidationCreate,
    ReviewDownstreamRecord,
    ReviewValidationResponse,
    ReviewQualityMetrics,
    ReviewImpactMetrics,
)
from app.modules.market_validation.reviews.service import ReviewValidationService
from app.modules.market_validation.provider_retention.schemas import (
    ProviderActivityRecord,
    ProviderRetentionResponse,
    ProviderRetentionOverview,
    ProviderSupplyDensityMetrics,
)
from app.modules.market_validation.provider_retention.service import ProviderRetentionService
from app.modules.market_validation.creator_retention.schemas import (
    CreatorActivityRecord,
    CreatorRetentionResponse,
    CreatorLoopMetrics,
)
from app.modules.market_validation.creator_retention.service import CreatorRetentionService
from app.modules.market_validation.network.schemas import (
    NetworkInteractionCreate,
    NetworkInteractionResponse,
    NetworkDensityMetrics,
    NetworkHealthScore,
    NetworkGapResponse,
    NetworkRegionalView,
)
from app.modules.market_validation.network.service import NetworkService
from app.modules.market_validation.retention_analysis.schemas import MacroRetentionReport
from app.modules.market_validation.retention_analysis.service import RetentionAnalysisService

router = APIRouter(prefix="/retention", tags=["Market Validation - Retention & Network"])

consumer_service = ConsumerRetentionService()
cohort_service = CohortService()
referral_service = ReferralService()
review_service = ReviewValidationService()
provider_service = ProviderRetentionService()
creator_service = CreatorRetentionService()
network_service = NetworkService()
analysis_service = RetentionAnalysisService(
    consumer_service=consumer_service,
    cohort_service=cohort_service,
    provider_service=provider_service,
    creator_service=creator_service,
    network_service=network_service,
)


# --- 1. OVERVIEW & CONSUMER RETENTION ---

@router.get("/overview", response_model=RetentionOverview)
def get_retention_overview(
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return consumer_service.get_overview(db)


@router.post("/action", response_model=ConsumerRetentionResponse, status_code=status.HTTP_201_CREATED)
def record_meaningful_action(
    payload: MeaningfulActionRecord,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    record = consumer_service.record_action(db, payload)
    return ConsumerRetentionResponse.model_validate(record)


@router.post("/consumers/{user_id}/complete-trip", response_model=ConsumerRetentionResponse)
def mark_trip_completed(
    user_id: str,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    record = consumer_service.mark_completed_trip(db, user_id)
    return ConsumerRetentionResponse.model_validate(record)


@router.get("/consumers")
def list_consumer_retention(
    state: str | None = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    total, items = consumer_service.repo.list(db, retention_state=state, limit=limit, offset=offset)
    return {
        "total": total,
        "items": [ConsumerRetentionResponse.model_validate(i) for i in items],
    }


@router.get("/trip-cycle", response_model=TripCycleMetrics)
def get_trip_cycle_metrics(
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return consumer_service.get_trip_cycle_metrics(db)


@router.get("/next-trip", response_model=NextTripMetrics)
def get_next_trip_metrics(
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return consumer_service.get_next_trip_metrics(db)


# --- 2. COHORTS ---

@router.get("/cohorts", response_model=CohortListResponse)
def list_cohorts(
    acquisition_source: str | None = Query(None),
    geography: str | None = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return cohort_service.list_cohorts(db, acquisition_source=acquisition_source, geography=geography, limit=limit, offset=offset)


@router.post("/cohorts", response_model=CohortResponse, status_code=status.HTTP_201_CREATED)
def create_cohort(
    payload: CohortCreate,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return cohort_service.create_cohort(db, payload)


@router.patch("/cohorts/{cohort_id}", response_model=CohortResponse)
def update_cohort_metrics(
    cohort_id: str,
    payload: CohortUpdateMetrics,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return cohort_service.update_metrics(db, cohort_id, payload)


# --- 3. REFERRALS ---

@router.post("/referrals", response_model=ReferralResponse, status_code=status.HTTP_201_CREATED)
def create_referral(
    payload: ReferralCreate,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return referral_service.create_referral(db, payload)


@router.get("/referrals/funnel", response_model=ReferralFunnelMetrics)
def get_referral_funnel(
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return referral_service.get_funnel_metrics(db)


@router.get("/referrals/{referral_id_or_code}", response_model=ReferralResponse)
def get_referral(
    referral_id_or_code: str,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return referral_service.get_referral(db, referral_id_or_code)


@router.get("/referrals/{referral_id_or_code}/status", response_model=ReferralStatusResponse)
def get_referral_status(
    referral_id_or_code: str,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return referral_service.get_status(db, referral_id_or_code)


@router.post("/referrals/{referral_id_or_code}/activate", response_model=ReferralResponse)
def activate_referral(
    referral_id_or_code: str,
    payload: ReferralActivateRequest,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return referral_service.activate_referral(db, referral_id_or_code, payload)


# --- 4. REVIEWS ---

@router.post("/reviews", response_model=ReviewValidationResponse, status_code=status.HTTP_201_CREATED)
def record_review_validation(
    payload: ReviewValidationCreate,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return review_service.record_review(db, payload)


@router.get("/reviews/quality", response_model=ReviewQualityMetrics)
def get_review_quality(
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return review_service.get_quality_metrics(db)


@router.get("/reviews/impact", response_model=ReviewImpactMetrics)
def get_review_impact(
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return review_service.get_impact_metrics(db)


@router.post("/reviews/{review_id}/impact", response_model=ReviewValidationResponse)
def record_review_downstream_impact(
    review_id: str,
    payload: ReviewDownstreamRecord,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return review_service.record_downstream_impact(db, review_id, payload)


# --- 5. PROVIDERS ---

@router.get("/providers", response_model=ProviderRetentionOverview)
def get_providers_retention_overview(
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return provider_service.get_overview(db)


@router.post("/providers/activity", response_model=ProviderRetentionResponse)
def record_provider_activity(
    payload: ProviderActivityRecord,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return provider_service.record_activity(db, payload)


@router.get("/providers/supply-density", response_model=ProviderSupplyDensityMetrics)
def get_provider_supply_density(
    region: str = Query("BASTAR"),
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return provider_service.get_supply_density(db, region=region)


# --- 6. CREATORS ---

@router.get("/creators", response_model=CreatorLoopMetrics)
def get_creators_loop_metrics(
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return creator_service.get_loop_metrics(db)


@router.post("/creators/activity", response_model=CreatorRetentionResponse)
def record_creator_activity(
    payload: CreatorActivityRecord,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return creator_service.record_activity(db, payload)


# --- 7. NETWORK ---

@router.get("/network", response_model=NetworkDensityMetrics)
@router.get("/network/density", response_model=NetworkDensityMetrics)
def get_network_density(
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return network_service.get_density_metrics(db)


@router.get("/network/health", response_model=NetworkHealthScore)
def get_network_health(
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return network_service.get_health_score(db)


@router.get("/network/gaps", response_model=list[NetworkGapResponse])
def get_network_gaps(
    geography: str | None = Query(None),
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return network_service.get_network_gaps(db, geography=geography)


@router.get("/network/by-region", response_model=list[NetworkRegionalView])
def get_network_by_region(
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return network_service.get_regional_view(db)


@router.post("/network/interactions", response_model=NetworkInteractionResponse, status_code=status.HTTP_201_CREATED)
def record_network_interaction(
    payload: NetworkInteractionCreate,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return network_service.record_interaction(db, payload)


# --- 8. MACRO ANALYSIS ---

@router.get("/analysis/macro", response_model=MacroRetentionReport)
def get_macro_retention_report(
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    return analysis_service.get_macro_report(db)
