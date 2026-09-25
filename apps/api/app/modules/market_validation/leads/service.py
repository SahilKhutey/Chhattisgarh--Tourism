from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.leads.models import MarketLead
from app.modules.market_validation.providers.models import MarketProvider
from app.modules.market_validation.leads.schemas import (
    LeadCreate,
    LeadUpdate,
    LeadQualify,
    LeadResponseRecord,
    LeadBookingRecord,
)
from app.modules.market_validation.leads.repository import LeadRepository


class LeadService:
    def __init__(self, repo: LeadRepository | None = None):
        self.repo = repo or LeadRepository()

    def create_lead(self, db: Session, payload: LeadCreate) -> MarketLead:
        provider = db.get(MarketProvider, payload.provider_id)
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Provider {payload.provider_id} not found.",
            )

        lead = MarketLead(
            id=uuid.uuid4(),
            provider_id=payload.provider_id,
            source=payload.source,
            traveler_segment=payload.traveler_segment,
            destination=payload.destination,
            experience=payload.experience,
            request_type=payload.request_type,
            status=payload.status,
            qualified=payload.qualified,
            conversion_status=payload.conversion_status,
            outcome=payload.outcome,
            created_at=datetime.now(timezone.utc),
        )
        return self.repo.create(db, lead)

    def get_lead(self, db: Session, lead_id: uuid.UUID) -> MarketLead:
        lead = self.repo.get_by_id(db, lead_id)
        if not lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lead {lead_id} not found.",
            )
        return lead

    def list_leads(
        self,
        db: Session,
        provider_id: uuid.UUID | None = None,
        status: str | None = None,
        qualified: bool | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketLead]]:
        return self.repo.list(
            db,
            provider_id=provider_id,
            status=status,
            qualified=qualified,
            limit=limit,
            offset=offset,
        )

    def update_lead(
        self,
        db: Session,
        lead_id: uuid.UUID,
        payload: LeadUpdate,
    ) -> MarketLead:
        lead = self.get_lead(db, lead_id)
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(lead, field, value)

        if lead.provider_response_at and lead.created_at:
            resp_dt = lead.provider_response_at
            if resp_dt.tzinfo is None:
                resp_dt = resp_dt.replace(tzinfo=timezone.utc)
            crea_dt = lead.created_at
            if crea_dt.tzinfo is None:
                crea_dt = crea_dt.replace(tzinfo=timezone.utc)
            delta = (resp_dt - crea_dt).total_seconds()
            lead.response_time_seconds = max(0, int(delta))

        return self.repo.update(db, lead)

    def qualify_lead(
        self,
        db: Session,
        lead_id: uuid.UUID,
        payload: LeadQualify,
    ) -> MarketLead:
        lead = self.get_lead(db, lead_id)
        lead.qualified = payload.qualified
        lead.status = payload.status
        return self.repo.update(db, lead)

    def record_response(
        self,
        db: Session,
        lead_id: uuid.UUID,
        payload: LeadResponseRecord,
    ) -> MarketLead:
        lead = self.get_lead(db, lead_id)
        response_time = payload.response_at or datetime.now(timezone.utc)
        if response_time.tzinfo is None:
            response_time = response_time.replace(tzinfo=timezone.utc)
        created = lead.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        lead.provider_response_at = response_time
        delta = (response_time - created).total_seconds()
        lead.response_time_seconds = max(0, int(delta))
        lead.status = payload.status
        if payload.outcome:
            lead.outcome = payload.outcome
        return self.repo.update(db, lead)

    def record_booking(
        self,
        db: Session,
        lead_id: uuid.UUID,
        payload: LeadBookingRecord,
    ) -> MarketLead:
        lead = self.get_lead(db, lead_id)
        lead.status = payload.status
        lead.conversion_status = payload.conversion_status
        if payload.outcome:
            lead.outcome = payload.outcome
        return self.repo.update(db, lead)
