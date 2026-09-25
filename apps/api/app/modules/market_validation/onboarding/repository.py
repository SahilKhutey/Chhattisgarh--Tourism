from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.modules.market_validation.onboarding.models import MarketProviderOnboarding


class OnboardingRepository:
    def create(self, db: Session, onboarding: MarketProviderOnboarding) -> MarketProviderOnboarding:
        db.add(onboarding)
        db.commit()
        db.refresh(onboarding)
        return onboarding

    def get_by_provider_id(self, db: Session, provider_id: UUID) -> MarketProviderOnboarding | None:
        stmt = select(MarketProviderOnboarding).where(MarketProviderOnboarding.provider_id == provider_id)
        return db.execute(stmt).scalar_one_or_none()

    def get_by_id(self, db: Session, onboarding_id: UUID) -> MarketProviderOnboarding | None:
        return db.get(MarketProviderOnboarding, onboarding_id)

    def list(
        self,
        db: Session,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketProviderOnboarding]]:
        stmt = select(MarketProviderOnboarding)
        if status:
            stmt = stmt.where(MarketProviderOnboarding.status == status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(desc(MarketProviderOnboarding.started_at)).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)

    def update(self, db: Session, onboarding: MarketProviderOnboarding) -> MarketProviderOnboarding:
        db.commit()
        db.refresh(onboarding)
        return onboarding
