from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.modules.market_validation.provider_feedback.models import MarketProviderFeedback


class ProviderFeedbackRepository:
    def create(self, db: Session, feedback: MarketProviderFeedback) -> MarketProviderFeedback:
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return feedback

    def get_by_id(self, db: Session, feedback_id: UUID) -> MarketProviderFeedback | None:
        return db.get(MarketProviderFeedback, feedback_id)

    def list(
        self,
        db: Session,
        provider_id: UUID | None = None,
        journey: str | None = None,
        sentiment: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketProviderFeedback]]:
        stmt = select(MarketProviderFeedback)
        if provider_id:
            stmt = stmt.where(MarketProviderFeedback.provider_id == provider_id)
        if journey:
            stmt = stmt.where(MarketProviderFeedback.journey == journey)
        if sentiment:
            stmt = stmt.where(MarketProviderFeedback.sentiment == sentiment)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(desc(MarketProviderFeedback.created_at)).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)
