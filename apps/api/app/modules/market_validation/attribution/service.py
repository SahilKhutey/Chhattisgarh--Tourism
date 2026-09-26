from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.attribution.models import MarketAttribution
from app.modules.market_validation.attribution.schemas import AttributionCreate
from app.modules.market_validation.attribution.repository import AttributionRepository


class AttributionService:
    def __init__(self, repo: AttributionRepository | None = None):
        self.repo = repo or AttributionRepository()

    def record_attribution(self, db: Session, payload: AttributionCreate) -> MarketAttribution:
        attr = MarketAttribution(
            id=uuid.uuid4(),
            booking_id=payload.booking_id,
            lead_id=payload.lead_id,
            anonymous_user_id=payload.anonymous_user_id,
            session_id=payload.session_id,
            source_event_id=payload.source_event_id,
            discovery_source=payload.discovery_source,
            destination_id=payload.destination_id,
            experience_id=payload.experience_id,
            provider_id=payload.provider_id,
            campaign_id=payload.campaign_id,
            experiment_id=payload.experiment_id,
            attribution_window_days=payload.attribution_window_days,
            chain_details=payload.chain_details,
            created_at=datetime.now(timezone.utc),
        )
        return self.repo.create(db, attr)

    def get_attribution(self, db: Session, booking_id: str) -> MarketAttribution:
        attr = self.repo.get_by_booking_id(db, booking_id)
        if not attr:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Attribution record for booking {booking_id} not found.",
            )
        return attr
