from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.modules.market_validation.conversion.models import MarketConversion


class ConversionRepository:
    def create(self, db: Session, conversion: MarketConversion) -> MarketConversion:
        db.add(conversion)
        db.commit()
        db.refresh(conversion)
        return conversion

    def list(
        self,
        db: Session,
        provider_id: str | None = None,
        conversion_stage: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketConversion]]:
        stmt = select(MarketConversion)
        if provider_id:
            stmt = stmt.where(MarketConversion.provider_id == provider_id)
        if conversion_stage:
            stmt = stmt.where(MarketConversion.conversion_stage == conversion_stage)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(desc(MarketConversion.converted_at)).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)

    def count_by_stage(self, db: Session) -> dict[str, int]:
        stmt = select(
            MarketConversion.conversion_stage,
            func.count(MarketConversion.id),
        ).group_by(MarketConversion.conversion_stage)
        rows = db.execute(stmt).all()
        return {r[0]: r[1] for r in rows}

    def sum_value_by_stage(self, db: Session, stage: str = "COMPLETED") -> float:
        stmt = select(func.coalesce(func.sum(MarketConversion.value), 0.0)).where(
            MarketConversion.conversion_stage == stage
        )
        return float(db.execute(stmt).scalar_one())
