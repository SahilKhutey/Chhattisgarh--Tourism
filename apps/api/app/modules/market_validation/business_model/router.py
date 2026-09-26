from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.market_validation.auth import require_market_researcher
from app.modules.admin.dependencies import AdminUser

from app.modules.market_validation.business_model.schemas import (
    BusinessModelCreate,
    BusinessModelResponse,
    RevenueStreamCreate,
    RevenueStreamResponse,
    BusinessModelCanvas,
)
from app.modules.market_validation.business_model.service import BusinessModelService

from app.modules.market_validation.monetization.schemas import (
    OfferCreate,
    OfferResponse,
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate,
    MonetizationPolicyResponse,
)
from app.modules.market_validation.monetization.service import MonetizationService

from app.modules.market_validation.pricing.schemas import (
    PricingTiersCatalog,
    PricingExperimentCreate,
    PricingExperimentResponse,
    PricingEvaluationResponse,
)
from app.modules.market_validation.pricing.service import PricingService

from app.modules.market_validation.willingness_to_pay.schemas import (
    WillingnessToPayCreate,
    WillingnessToPayResponse,
    WillingnessToPaySummary,
    PriceSensitivityAnalysis,
)
from app.modules.market_validation.willingness_to_pay.service import WillingnessToPayService

from app.modules.market_validation.unit_economics.schemas import (
    UnitEconomicsInput,
    UnitEconomicsResponse,
    UnitEconomicsOverview,
)
from app.modules.market_validation.unit_economics.service import UnitEconomicsService

from app.modules.market_validation.experiments.schemas import (
    ObservationCreate,
    ObservationResponse,
    BusinessExperimentEvaluation,
)
from app.modules.market_validation.experiments.service import ExperimentService

from app.modules.market_validation.business_analysis.schemas import BusinessAnalysisReport
from app.modules.market_validation.business_analysis.service import BusinessAnalysisService

router = APIRouter(
    prefix="/business",
    tags=["market-validation-business-model"],
)


# 1. Business Model & Revenue Streams
@router.get("/canvas", response_model=BusinessModelCanvas)
def get_business_model_canvas(
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = BusinessModelService(db)
    return service.get_canvas()


@router.get("/models", response_model=list[BusinessModelResponse])
def list_business_models(
    customer_type: str | None = None,
    revenue_model: str | None = None,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = BusinessModelService(db)
    return service.list_models(customer_type=customer_type, revenue_model=revenue_model)


@router.post("/models", response_model=BusinessModelResponse, status_code=status.HTTP_201_CREATED)
def create_business_model(
    data: BusinessModelCreate,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = BusinessModelService(db)
    return service.create_model(data)


@router.get("/revenue-streams", response_model=list[RevenueStreamResponse])
def list_revenue_streams(
    customer_type: str | None = None,
    stream_type: str | None = None,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = BusinessModelService(db)
    return service.list_streams(customer_type=customer_type, stream_type=stream_type)


@router.post("/revenue-streams", response_model=RevenueStreamResponse, status_code=status.HTTP_201_CREATED)
def create_revenue_stream(
    data: RevenueStreamCreate,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = BusinessModelService(db)
    return service.create_stream(data)


# 2. Monetization Offers, Orders, and Policies
@router.get("/offers", response_model=list[OfferResponse])
def list_offers(
    target_type: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = MonetizationService(db)
    return service.list_offers(target_type=target_type, status=status)


@router.post("/offers", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
def create_offer(
    data: OfferCreate,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = MonetizationService(db)
    return service.create_offer(data)


@router.get("/orders", response_model=list[OrderResponse])
def list_orders(
    customer_id: str | None = None,
    customer_type: str | None = None,
    order_status: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = MonetizationService(db)
    return service.list_orders(customer_id=customer_id, customer_type=customer_type, status=order_status)


@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = MonetizationService(db)
    return service.create_order(data)


@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = MonetizationService(db)
    return service.update_order_status(order_id, data)


@router.get("/policies", response_model=list[MonetizationPolicyResponse])
def list_policies(
    revenue_model: str | None = None,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = MonetizationService(db)
    return service.list_policies(revenue_model=revenue_model)


# 3. Pricing
@router.get("/pricing/catalog", response_model=PricingTiersCatalog)
def get_pricing_catalog(
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = PricingService(db)
    return service.get_pricing_catalog()


@router.get("/pricing/experiments", response_model=list[PricingExperimentResponse])
def list_pricing_experiments(
    customer_type: str | None = None,
    experiment_type: str | None = None,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = PricingService(db)
    return service.list_experiments(customer_type=customer_type, experiment_type=experiment_type)


@router.post("/pricing/experiments", response_model=PricingExperimentResponse, status_code=status.HTTP_201_CREATED)
def create_pricing_experiment(
    data: PricingExperimentCreate,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = PricingService(db)
    return service.create_experiment(data)


@router.get("/pricing/experiments/{experiment_id}/evaluate", response_model=PricingEvaluationResponse)
def evaluate_pricing_experiment(
    experiment_id: str,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = PricingService(db)
    return service.evaluate_experiment(experiment_id)


# 4. Willingness to Pay
@router.get("/willingness-to-pay/summary", response_model=WillingnessToPaySummary)
def get_willingness_to_pay_summary(
    participant_type: str = Query("PROVIDER"),
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = WillingnessToPayService(db)
    return service.get_summary(participant_type=participant_type)


@router.get("/willingness-to-pay/sensitivity", response_model=PriceSensitivityAnalysis)
def get_price_sensitivity(
    participant_type: str = Query("PROVIDER"),
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = WillingnessToPayService(db)
    return service.get_price_sensitivity(participant_type=participant_type)


@router.post("/willingness-to-pay", response_model=WillingnessToPayResponse, status_code=status.HTTP_201_CREATED)
def record_willingness_to_pay(
    data: WillingnessToPayCreate,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = WillingnessToPayService(db)
    return service.record_response(data)


# 5. Unit Economics
@router.get("/unit-economics/overview", response_model=UnitEconomicsOverview)
def get_unit_economics_overview(
    segment: str | None = None,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = UnitEconomicsService(db)
    return service.get_overview(segment=segment)


@router.post("/unit-economics", response_model=UnitEconomicsResponse, status_code=status.HTTP_201_CREATED)
def compute_unit_economics(
    data: UnitEconomicsInput,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = UnitEconomicsService(db)
    return service.compute_and_save(data)


# 6. Business Experiments Observations & Evaluations
@router.post("/experiments/observations", response_model=ObservationResponse, status_code=status.HTTP_201_CREATED)
def record_experiment_observation(
    data: ObservationCreate,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = ExperimentService(db)
    return service.record_observation(data)


@router.get("/experiments/{experiment_id}/evaluate", response_model=BusinessExperimentEvaluation)
def evaluate_business_experiment(
    experiment_id: str,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = ExperimentService(db)
    return service.evaluate_experiment(experiment_id)


# 7. Executive Business Model Report
@router.get("/report", response_model=BusinessAnalysisReport)
def get_executive_business_report(
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_market_researcher),
):
    service = BusinessAnalysisService(db)
    return service.generate_report()
