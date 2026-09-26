from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.modules.market_validation.conversion.models import MarketConversion
from app.modules.market_validation.conversion.schemas import (
    ConversionCreate,
    ConversionFunnelResponse,
    FunnelStageItem,
)
from app.modules.market_validation.conversion.repository import ConversionRepository
from app.modules.market_validation.leads.models import MarketLead
from app.modules.market_validation.booking_intent.models import MarketBookingIntent
from app.modules.market_validation.provider_response.models import MarketProviderResponse


class ConversionService:
    def __init__(self, repo: ConversionRepository | None = None):
        self.repo = repo or ConversionRepository()

    def record_conversion(self, db: Session, payload: ConversionCreate) -> MarketConversion:
        conversion = MarketConversion(
            id=uuid.uuid4(),
            lead_id=payload.lead_id,
            booking_intent_id=payload.booking_intent_id,
            booking_id=payload.booking_id,
            provider_id=payload.provider_id,
            consumer_id=payload.consumer_id,
            conversion_stage=payload.conversion_stage,
            value=payload.value,
            currency=payload.currency,
            attributed_source=payload.attributed_source,
            experiment_id=payload.experiment_id,
            converted_at=datetime.now(timezone.utc),
        )
        return self.repo.create(db, conversion)

    def list_conversions(
        self,
        db: Session,
        provider_id: str | None = None,
        conversion_stage: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketConversion]]:
        return self.repo.list(
            db,
            provider_id=provider_id,
            conversion_stage=conversion_stage,
            limit=limit,
            offset=offset,
        )

    def get_funnel(self, db: Session) -> ConversionFunnelResponse:
        # Query counts across canonical lifecycle tables
        total_leads = db.execute(select(func.count(MarketLead.id))).scalar_one()
        qualified_leads = db.execute(
            select(func.count(MarketLead.id)).where(MarketLead.qualification_status == "QUALIFIED")
        ).scalar_one()
        provider_responses = db.execute(
            select(func.count(MarketProviderResponse.id))
        ).scalar_one()
        booking_intents = db.execute(
            select(func.count(MarketBookingIntent.id))
        ).scalar_one()
        bookings = db.execute(
            select(func.count(MarketBookingIntent.id)).where(
                MarketBookingIntent.status.in_(["BOOKED", "COMPLETED"])
            )
        ).scalar_one()

        completed_conversions = self.repo.count_by_stage(db).get("COMPLETED", 0)
        total_value = self.repo.sum_value_by_stage(db, "COMPLETED")

        # Assume provider impressions/views baseline
        estimated_views = max(total_leads * 4, 100) if total_leads > 0 else 100
        contacts = total_leads

        raw_stages = [
            ("Provider View", estimated_views),
            ("Contact / Lead", contacts),
            ("Qualified Lead", qualified_leads),
            ("Provider Response", provider_responses),
            ("Booking Intent", booking_intents),
            ("Booking", bookings),
            ("Completed Experience", completed_conversions),
        ]

        stage_items: list[FunnelStageItem] = []
        prev_count = estimated_views

        for idx, (name, count) in enumerate(raw_stages):
            conv_rate = (count / prev_count) if prev_count > 0 else 0.0
            dropoff = max(0.0, 1.0 - conv_rate) if idx > 0 else 0.0
            stage_items.append(
                FunnelStageItem(
                    stage=name,
                    count=count,
                    conversion_rate=round(conv_rate, 4),
                    dropoff_rate=round(dropoff, 4),
                )
            )
            prev_count = count if count > 0 else 1

        overall_conv = (
            completed_conversions / estimated_views if estimated_views > 0 else 0.0
        )

        return ConversionFunnelResponse(
            total_views=estimated_views,
            stages=stage_items,
            overall_conversion_rate=round(overall_conv, 4),
            total_facilitated_value=total_value,
            currency="INR",
        )
