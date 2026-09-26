from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.modules.market_validation.provider_response.models import MarketProviderResponse
from app.modules.market_validation.provider_response.schemas import ProviderResponseCreate
from app.modules.market_validation.provider_response.repository import ProviderResponseRepository
from app.modules.market_validation.leads.models import MarketLead


class ProviderResponseService:
    def __init__(self, repo: ProviderResponseRepository | None = None):
        self.repo = repo or ProviderResponseRepository()

    @staticmethod
    def determine_response_bucket(seconds: int) -> str:
        if seconds < 300:
            return "<5m"
        elif seconds < 1800:
            return "5-30m"
        elif seconds < 7200:
            return "30-120m"
        elif seconds < 86400:
            return "2-24h"
        else:
            return ">24h"

    def record_response(
        self,
        db: Session,
        lead: MarketLead,
        payload: ProviderResponseCreate,
    ) -> MarketProviderResponse:
        now = datetime.now(timezone.utc)
        created_time = lead.created_at
        if created_time.tzinfo is None:
            created_time = created_time.replace(tzinfo=timezone.utc)
        delta_seconds = max(0, int((now - created_time).total_seconds()))
        bucket = self.determine_response_bucket(delta_seconds)

        response_obj = MarketProviderResponse(
            id=uuid.uuid4(),
            lead_id=lead.lead_id or str(lead.id),
            provider_id=payload.provider_id,
            response_type=payload.response_type,
            response_time_seconds=delta_seconds,
            response_bucket=bucket,
            response_message=payload.response_message,
            offered_price=payload.offered_price,
            offered_date=payload.offered_date,
            metadata_json=payload.metadata_json,
            responded_at=now,
        )
        saved = self.repo.create(db, response_obj)

        lead.provider_response_at = now
        lead.response_time_seconds = delta_seconds
        lead.provider_response_status = payload.response_type
        lead.status = "RESPONDED"
        db.commit()
        db.refresh(lead)

        return saved
