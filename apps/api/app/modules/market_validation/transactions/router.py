from __future__ import annotations

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher

# Leads
from app.modules.market_validation.leads.schemas import (
    MarketLeadCreate,
    LeadUpdate,
    MarketLeadQualifyRequest,
    MarketLeadRespondRequest,
    LeadResponse,
    LeadListResponse,
)
from app.modules.market_validation.leads.service import LeadService

# Booking Intent
from app.modules.market_validation.booking_intent.schemas import (
    BookingIntentCreate,
    BookingIntentUpdate,
    BookingIntentConfirmRequest,
    BookingIntentCancelRequest,
    BookingIntentResponse,
    BookingIntentListResponse,
)
from app.modules.market_validation.booking_intent.service import BookingIntentService

# Provider Response
from app.modules.market_validation.provider_response.schemas import (
    ProviderResponseCreate,
    ProviderResponseItem,
)
from app.modules.market_validation.provider_response.service import ProviderResponseService

# Conversion
from app.modules.market_validation.conversion.schemas import (
    ConversionCreate,
    ConversionResponse,
    ConversionFunnelResponse,
)
from app.modules.market_validation.conversion.service import ConversionService

# Attribution
from app.modules.market_validation.attribution.schemas import (
    AttributionCreate,
    AttributionResponse,
)
from app.modules.market_validation.attribution.service import AttributionService

# Transactions
from app.modules.market_validation.transactions.schemas import (
    TransactionCreate,
    TransactionResponse,
    TransactionCompleteRequest,
    TransactionFeedbackCreate,
    TransactionFeedbackResponse,
)
from app.modules.market_validation.transactions.service import TransactionService

# Analysis
from app.modules.market_validation.transaction_analysis.schemas import (
    LeadsAnalysisResponse,
    ProviderResponseAnalysis,
    BookingAnalysis,
    CompletionAnalysis,
    EconomicValueAnalysis,
    ProviderValueAnalysis,
)
from app.modules.market_validation.transaction_analysis.service import TransactionAnalysisService

router = APIRouter(prefix="", tags=["MV7 - Transactions & Conversion Validation"])

lead_service = LeadService()
intent_service = BookingIntentService()
response_service = ProviderResponseService()
conversion_service = ConversionService()
attribution_service = AttributionService()
transaction_service = TransactionService()
analysis_service = TransactionAnalysisService()


# -----------------------------------------------------------------------------
# LEADS ENDPOINTS (Section 36)
# -----------------------------------------------------------------------------
@router.post("/leads", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    payload: MarketLeadCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    lead = lead_service.create_lead(db, payload)
    # Record contact conversion
    conversion_service.record_conversion(
        db,
        ConversionCreate(
            lead_id=lead.lead_id or str(lead.id),
            provider_id=str(lead.provider_id),
            consumer_id=lead.consumer_id,
            conversion_stage="CONTACT",
            value=0.0,
            attributed_source=lead.source,
        ),
    )
    return lead


@router.get("/leads", response_model=LeadListResponse)
def list_leads(
    provider_id: Optional[uuid.UUID] = None,
    status: Optional[str] = None,
    qualified: Optional[bool] = None,
    qualification_status: Optional[str] = None,
    source: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = lead_service.list_leads(
        db,
        provider_id=provider_id,
        status=status,
        qualified=qualified,
        qualification_status=qualification_status,
        source=source,
        limit=limit,
        offset=offset,
    )
    return {"items": items, "total": total}


@router.get("/leads/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return lead_service.get_lead(db, lead_id)


@router.patch("/leads/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: str,
    payload: LeadUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return lead_service.update_lead(db, lead_id, payload)


@router.post("/leads/{lead_id}/qualify", response_model=LeadResponse)
def qualify_lead(
    lead_id: str,
    payload: MarketLeadQualifyRequest,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    lead = lead_service.qualify_lead(db, lead_id, payload)
    if lead.qualified:
        conversion_service.record_conversion(
            db,
            ConversionCreate(
                lead_id=lead.lead_id or str(lead.id),
                provider_id=str(lead.provider_id),
                consumer_id=lead.consumer_id,
                conversion_stage="QUALIFIED",
                value=0.0,
                attributed_source=lead.source,
            ),
        )
    return lead


# -----------------------------------------------------------------------------
# PROVIDER RESPONSE ENDPOINTS (Section 36)
# -----------------------------------------------------------------------------
@router.post("/leads/{lead_id}/respond", response_model=ProviderResponseItem)
def provider_respond_lead(
    lead_id: str,
    payload: MarketLeadRespondRequest,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    lead = lead_service.get_lead(db, lead_id)
    resp = response_service.record_response(
        db,
        lead,
        ProviderResponseCreate(
            lead_id=lead.lead_id or str(lead.id),
            provider_id=str(lead.provider_id),
            response_type=payload.response_type,
            response_message=payload.response_message,
            offered_price=payload.offered_price,
            offered_date=payload.offered_date,
            metadata_json=payload.metadata,
        ),
    )
    return resp


@router.post("/leads/{lead_id}/decline", response_model=ProviderResponseItem)
def provider_decline_lead(
    lead_id: str,
    reason: Optional[str] = Query("NO_AVAILABILITY"),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    lead = lead_service.get_lead(db, lead_id)
    return response_service.record_response(
        db,
        lead,
        ProviderResponseCreate(
            lead_id=lead.lead_id or str(lead.id),
            provider_id=str(lead.provider_id),
            response_type="DECLINED",
            response_message=f"Declined with reason: {reason}",
        ),
    )


@router.post("/leads/{lead_id}/question", response_model=ProviderResponseItem)
def provider_ask_question(
    lead_id: str,
    question: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    lead = lead_service.get_lead(db, lead_id)
    return response_service.record_response(
        db,
        lead,
        ProviderResponseCreate(
            lead_id=lead.lead_id or str(lead.id),
            provider_id=str(lead.provider_id),
            response_type="QUESTION",
            response_message=question,
        ),
    )


# -----------------------------------------------------------------------------
# BOOKING INTENT ENDPOINTS (Section 36)
# -----------------------------------------------------------------------------
@router.post("/booking-intent", response_model=BookingIntentResponse, status_code=status.HTTP_201_CREATED)
def create_booking_intent(
    payload: BookingIntentCreate,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    intent = intent_service.create_intent(db, payload, idempotency_key=idempotency_key)
    conversion_service.record_conversion(
        db,
        ConversionCreate(
            lead_id=intent.lead_id,
            booking_intent_id=intent.intent_id,
            provider_id=intent.provider_id,
            consumer_id=intent.consumer_id,
            conversion_stage="BOOKING_INTENT",
            value=intent.amount_estimate,
            attributed_source="DIRECT",
        ),
    )
    return intent


@router.get("/booking-intent/{intent_id}", response_model=BookingIntentResponse)
def get_booking_intent(
    intent_id: str,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return intent_service.get_intent(db, intent_id)


@router.patch("/booking-intent/{intent_id}", response_model=BookingIntentResponse)
def update_booking_intent(
    intent_id: str,
    payload: BookingIntentUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return intent_service.update_intent(db, intent_id, payload)


@router.post("/booking-intent/{intent_id}/confirm", response_model=BookingIntentResponse)
def confirm_booking_intent(
    intent_id: str,
    payload: BookingIntentConfirmRequest,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    intent = intent_service.confirm_intent(db, intent_id, payload)
    if intent.status == "BOOKED":
        # Create corresponding transaction
        tx = transaction_service.create_transaction(
            db,
            TransactionCreate(
                booking_id=intent.intent_id,
                provider_id=intent.provider_id,
                consumer_id=intent.consumer_id,
                gross_amount=intent.amount_estimate,
                currency=intent.currency,
                completion_status="SCHEDULED",
                idempotency_key=idempotency_key,
            ),
            idempotency_key=idempotency_key,
        )
        conversion_service.record_conversion(
            db,
            ConversionCreate(
                lead_id=intent.lead_id,
                booking_intent_id=intent.intent_id,
                booking_id=tx.transaction_id,
                provider_id=intent.provider_id,
                consumer_id=intent.consumer_id,
                conversion_stage="BOOKED",
                value=intent.amount_estimate,
                attributed_source="DIRECT",
            ),
        )
    return intent


@router.post("/booking-intent/{intent_id}/cancel", response_model=BookingIntentResponse)
def cancel_booking_intent(
    intent_id: str,
    payload: BookingIntentCancelRequest,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return intent_service.cancel_intent(db, intent_id, payload)


# -----------------------------------------------------------------------------
# CONVERSION ENDPOINTS (Section 36)
# -----------------------------------------------------------------------------
@router.get("/conversion", response_model=list[ConversionResponse])
def list_conversions(
    provider_id: Optional[str] = None,
    conversion_stage: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = conversion_service.list_conversions(
        db,
        provider_id=provider_id,
        conversion_stage=conversion_stage,
        limit=limit,
        offset=offset,
    )
    return items


@router.get("/conversion/funnel", response_model=ConversionFunnelResponse)
def get_conversion_funnel(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return conversion_service.get_funnel(db)


# -----------------------------------------------------------------------------
# ATTRIBUTION ENDPOINTS (Section 36)
# -----------------------------------------------------------------------------
@router.post("/attribution", response_model=AttributionResponse, status_code=status.HTTP_201_CREATED)
def record_attribution(
    payload: AttributionCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return attribution_service.record_attribution(db, payload)


@router.get("/attribution/{booking_id}", response_model=AttributionResponse)
def get_attribution(
    booking_id: str,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return attribution_service.get_attribution(db, booking_id)


# -----------------------------------------------------------------------------
# TRANSACTIONS & COMPLETION ENDPOINTS
# -----------------------------------------------------------------------------
@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return transaction_service.create_transaction(db, payload, idempotency_key=idempotency_key)


@router.get("/", response_model=list[TransactionResponse])
def list_transactions(
    provider_id: Optional[str] = None,
    consumer_id: Optional[str] = None,
    completion_status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = transaction_service.list_transactions(
        db,
        provider_id=provider_id,
        consumer_id=consumer_id,
        completion_status=completion_status,
        limit=limit,
        offset=offset,
    )
    return items


@router.get("/{tx_id}", response_model=TransactionResponse)
def get_transaction(
    tx_id: str,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return transaction_service.get_transaction(db, tx_id)


@router.post("/{tx_id}/complete", response_model=TransactionResponse)
def complete_transaction(
    tx_id: str,
    payload: TransactionCompleteRequest,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    tx = transaction_service.complete_transaction(db, tx_id, payload)
    if tx.completion_status == "COMPLETED":
        conversion_service.record_conversion(
            db,
            ConversionCreate(
                lead_id=tx.booking_id,
                booking_id=tx.transaction_id,
                provider_id=tx.provider_id,
                consumer_id=tx.consumer_id,
                conversion_stage="COMPLETED",
                value=tx.gross_amount,
                attributed_source="DIRECT",
            ),
        )
    return tx


@router.post("/{tx_id}/feedback", response_model=TransactionFeedbackResponse)
def submit_feedback(
    tx_id: str,
    payload: TransactionFeedbackCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return transaction_service.submit_feedback(db, tx_id, payload)


@router.get("/{tx_id}/feedback", response_model=list[TransactionFeedbackResponse])
def list_feedback(
    tx_id: str,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return transaction_service.list_feedback(db, tx_id)


# -----------------------------------------------------------------------------
# ANALYTICS ENDPOINTS (Section 36)
# -----------------------------------------------------------------------------
@router.get("/analysis/leads", response_model=LeadsAnalysisResponse)
def analyze_leads(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return analysis_service.get_leads_analysis(db)


@router.get("/analysis/provider-response", response_model=ProviderResponseAnalysis)
def analyze_provider_response(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return analysis_service.get_provider_response_analysis(db)


@router.get("/analysis/booking", response_model=BookingAnalysis)
def analyze_bookings(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return analysis_service.get_booking_analysis(db)


@router.get("/analysis/completion", response_model=CompletionAnalysis)
def analyze_completion(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return analysis_service.get_completion_analysis(db)


@router.get("/analysis/economic-value", response_model=EconomicValueAnalysis)
def analyze_economic_value(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return analysis_service.get_economic_value_analysis(db)


@router.get("/analysis/provider-value", response_model=ProviderValueAnalysis)
def analyze_provider_value(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return analysis_service.get_provider_value_analysis(db)
