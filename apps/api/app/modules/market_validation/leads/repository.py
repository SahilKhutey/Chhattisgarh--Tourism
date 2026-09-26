from __future__ import annotations

from uuid import UUID
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc, or_

from app.modules.market_validation.leads.models import MarketLead


class LeadRepository:
    def create(self, db: Session, lead: MarketLead) -> MarketLead:
        db.add(lead)
        db.commit()
        db.refresh(lead)
        return lead

    def get_by_id(self, db: Session, lead_id: UUID) -> MarketLead | None:
        return db.get(MarketLead, lead_id)

    def get_by_any_id(self, db: Session, identifier: str | UUID) -> MarketLead | None:
        if isinstance(identifier, UUID):
            return db.get(MarketLead, identifier)
        try:
            val_uuid = UUID(identifier)
            lead = db.get(MarketLead, val_uuid)
            if lead:
                return lead
        except (ValueError, AttributeError):
            pass
        stmt = select(MarketLead).where(MarketLead.lead_id == str(identifier))
        return db.execute(stmt).scalar_one_or_none()

    def find_duplicate(
        self,
        db: Session,
        provider_id: UUID,
        consumer_id: str | None = None,
        anonymous_user_id: str | None = None,
        experience_id: str | None = None,
        requested_date: datetime | None = None,
        window_hours: int = 24,
    ) -> MarketLead | None:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=window_hours)
        stmt = select(MarketLead).where(
            MarketLead.provider_id == provider_id,
            MarketLead.created_at >= cutoff,
        )
        if consumer_id:
            stmt = stmt.where(MarketLead.consumer_id == consumer_id)
        elif anonymous_user_id:
            stmt = stmt.where(MarketLead.anonymous_user_id == anonymous_user_id)
        else:
            return None

        if experience_id:
            stmt = stmt.where(MarketLead.experience_id == experience_id)
        if requested_date:
            stmt = stmt.where(MarketLead.requested_date == requested_date)

        return db.execute(stmt).scalars().first()

    def list(
        self,
        db: Session,
        provider_id: UUID | None = None,
        status: str | None = None,
        qualified: bool | None = None,
        qualification_status: str | None = None,
        source: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketLead]]:
        stmt = select(MarketLead)
        if provider_id:
            stmt = stmt.where(MarketLead.provider_id == provider_id)
        if status:
            stmt = stmt.where(MarketLead.status == status)
        if qualified is not None:
            stmt = stmt.where(MarketLead.qualified == qualified)
        if qualification_status:
            stmt = stmt.where(MarketLead.qualification_status == qualification_status)
        if source:
            stmt = stmt.where(MarketLead.source == source)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(desc(MarketLead.created_at)).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)

    def update(self, db: Session, lead: MarketLead) -> MarketLead:
        lead.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(lead)
        return lead
