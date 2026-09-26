from __future__ import annotations

from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.modules.market_validation.cohorts.models import MarketRetentionCohort


class CohortRepository:
    def get_by_id(self, db: Session, cohort_id: str) -> MarketRetentionCohort | None:
        stmt = select(MarketRetentionCohort).where(MarketRetentionCohort.id == str(cohort_id))
        return db.execute(stmt).scalars().first()

    def create(self, db: Session, cohort: MarketRetentionCohort) -> MarketRetentionCohort:
        db.add(cohort)
        db.commit()
        db.refresh(cohort)
        return cohort

    def update(self, db: Session, cohort: MarketRetentionCohort) -> MarketRetentionCohort:
        db.commit()
        db.refresh(cohort)
        return cohort

    def list(
        self,
        db: Session,
        acquisition_source: str | None = None,
        geography: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketRetentionCohort]]:
        stmt = select(MarketRetentionCohort)
        count_stmt = select(func.count(MarketRetentionCohort.id))

        if acquisition_source:
            stmt = stmt.where(MarketRetentionCohort.acquisition_source == acquisition_source)
            count_stmt = count_stmt.where(MarketRetentionCohort.acquisition_source == acquisition_source)

        if geography:
            stmt = stmt.where(MarketRetentionCohort.geography == geography)
            count_stmt = count_stmt.where(MarketRetentionCohort.geography == geography)

        total = db.execute(count_stmt).scalar() or 0
        items = db.execute(
            stmt.order_by(MarketRetentionCohort.cohort_date.desc()).limit(limit).offset(offset)
        ).scalars().all()

        return total, list(items)
