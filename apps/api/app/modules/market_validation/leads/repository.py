from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.modules.market_validation.leads.models import MarketLead


class LeadRepository:
    def create(self, db: Session, lead: MarketLead) -> MarketLead:
        db.add(lead)
        db.commit()
        db.refresh(lead)
        return lead

    def get_by_id(self, db: Session, lead_id: UUID) -> MarketLead | None:
        return db.get(MarketLead, lead_id)

    def list(
        self,
        db: Session,
        provider_id: UUID | None = None,
        status: str | None = None,
        qualified: bool | None = None,
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

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(desc(MarketLead.created_at)).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)

    def update(self, db: Session, lead: MarketLead) -> MarketLead:
        db.commit()
        db.refresh(lead)
        return lead
