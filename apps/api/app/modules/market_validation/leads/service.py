from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.leads.models import MarketLead
from app.modules.market_validation.providers.models import MarketProvider
from app.modules.market_validation.leads.schemas import (
    LeadCreate,
    MarketLeadCreate,
    LeadUpdate,
    LeadQualify,
    MarketLeadQualifyRequest,
    MarketLeadRespondRequest,
    LeadResponseRecord,
    LeadBookingRecord,
)
from app.modules.market_validation.leads.repository import LeadRepository


class LeadService:
    def __init__(self, repo: LeadRepository | None = None):
        self.repo = repo or LeadRepository()

    def create_lead(self, db: Session, payload: LeadCreate | MarketLeadCreate) -> MarketLead:
        provider = db.get(MarketProvider, payload.provider_id)
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Provider {payload.provider_id} not found.",
            )

        now = datetime.now(timezone.utc)
        lead_id_str = f"LEAD_{uuid.uuid4().hex[:12].upper()}"

        # Check duplicate lead (Section 33)
        consumer_id = getattr(payload, "consumer_id", None)
        anon_id = getattr(payload, "anonymous_user_id", None)
        exp_id = getattr(payload, "experience_id", None)
        req_date = getattr(payload, "requested_date", None)

        duplicate = self.repo.find_duplicate(
            db=db,
            provider_id=payload.provider_id,
            consumer_id=consumer_id,
            anonymous_user_id=anon_id,
            experience_id=exp_id,
            requested_date=req_date,
            window_hours=24,
        )

        qualification_status = "PENDING"
        disqualification_reason = None
        qualified_flag = False

        if duplicate:
            qualification_status = "DISQUALIFIED"
            disqualification_reason = "DUPLICATE"
        else:
            # Automatic heuristic check
            msg = getattr(payload, "message", None)
            if msg and len(msg.strip()) > 5:
                qualification_status = "QUALIFIED"
                qualified_flag = True

        lead = MarketLead(
            id=uuid.uuid4(),
            provider_id=payload.provider_id,
            lead_id=lead_id_str,
            consumer_id=consumer_id,
            anonymous_user_id=anon_id,
            session_id=getattr(payload, "session_id", None),
            source=payload.source,
            destination_id=getattr(payload, "destination_id", None),
            experience_id=exp_id,
            traveler_segment=payload.traveler_segment or "GENERAL",
            destination=payload.destination or "Bastar",
            experience=payload.experience or "Local Guided Experience",
            request_type=payload.request_type,
            requested_date=req_date,
            traveler_count=getattr(payload, "traveler_count", 1) or 1,
            budget_band=getattr(payload, "budget_band", None),
            message=getattr(payload, "message", None),
            status=getattr(payload, "status", "NEW") or "NEW",
            qualified=qualified_flag if hasattr(payload, "qualified") and payload.qualified is False else getattr(payload, "qualified", qualified_flag),
            qualification_status=qualification_status,
            disqualification_reason=disqualification_reason,
            provider_response_status="NEW",
            conversion_status=getattr(payload, "conversion_status", "CONTACT") or "CONTACT",
            outcome=getattr(payload, "outcome", None),
            lead_details=getattr(payload, "lead_details", None),
            created_at=now,
            updated_at=now,
        )
        return self.repo.create(db, lead)

    def get_lead(self, db: Session, lead_id: uuid.UUID | str) -> MarketLead:
        lead = self.repo.get_by_any_id(db, lead_id)
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
        qualification_status: str | None = None,
        source: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketLead]]:
        return self.repo.list(
            db,
            provider_id=provider_id,
            status=status,
            qualified=qualified,
            qualification_status=qualification_status,
            source=source,
            limit=limit,
            offset=offset,
        )

    def update_lead(self, db: Session, lead_id: uuid.UUID | str, payload: LeadUpdate) -> MarketLead:
        lead = self.get_lead(db, lead_id)
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(lead, key, value)
        return self.repo.update(db, lead)

    def qualify_lead(self, db: Session, lead_id: uuid.UUID | str, payload: LeadQualify | MarketLeadQualifyRequest) -> MarketLead:
        lead = self.get_lead(db, lead_id)
        if isinstance(payload, MarketLeadQualifyRequest):
            lead.qualification_status = payload.qualification_status
            lead.disqualification_reason = payload.disqualification_reason
            lead.qualified = payload.qualification_status == "QUALIFIED"
            if lead.qualified:
                lead.status = "QUALIFIED"
                lead.conversion_status = "QUALIFIED"
        else:
            lead.qualified = payload.qualified
            lead.qualification_status = "QUALIFIED" if payload.qualified else "DISQUALIFIED"
            if payload.qualified:
                lead.status = "QUALIFIED"
            if payload.outcome:
                lead.outcome = payload.outcome
        return self.repo.update(db, lead)

    def record_response(self, db: Session, lead_id: uuid.UUID | str, payload: LeadResponseRecord) -> MarketLead:
        lead = self.get_lead(db, lead_id)
        resp_time = payload.response_at or payload.provider_response_at or datetime.now(timezone.utc)
        lead.provider_response_at = resp_time
        if payload.response_time_seconds and payload.response_time_seconds > 0:
            lead.response_time_seconds = payload.response_time_seconds
        elif lead.created_at:
            created = lead.created_at
            if created.tzinfo is None:
                created = created.replace(tzinfo=timezone.utc)
            if resp_time.tzinfo is None:
                resp_time = resp_time.replace(tzinfo=timezone.utc)
            delta = (resp_time - created).total_seconds()
            lead.response_time_seconds = max(0, int(delta))
        else:
            lead.response_time_seconds = 0

        lead.status = payload.status or "RESPONDED"
        lead.provider_response_status = "RESPONDED"
        if payload.outcome:
            lead.outcome = payload.outcome
        return self.repo.update(db, lead)

    def record_booking(self, db: Session, lead_id: uuid.UUID | str, payload: LeadBookingRecord) -> MarketLead:
        lead = self.get_lead(db, lead_id)
        lead.status = "BOOKED"
        lead.conversion_status = payload.conversion_status
        lead.outcome = payload.outcome
        return self.repo.update(db, lead)

    def respond_lead(self, db: Session, lead_id: uuid.UUID | str, payload: MarketLeadRespondRequest) -> MarketLead:
        lead = self.get_lead(db, lead_id)
        now = datetime.now(timezone.utc)
        delta = (now - lead.created_at).total_seconds()
        lead.provider_response_at = now
        lead.response_time_seconds = int(delta)
        lead.provider_response_status = payload.response_type
        lead.status = "RESPONDED"
        return self.repo.update(db, lead)
