from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.modules.market_validation.geographic.models import MarketGeoValidation


class GeoRepository:
    def create(self, db: Session, destination: MarketGeoValidation) -> MarketGeoValidation:
        db.add(destination)
        db.commit()
        db.refresh(destination)
        return destination

    def get_by_id(self, db: Session, id: UUID) -> MarketGeoValidation | None:
        return db.get(MarketGeoValidation, id)

    def get_by_destination_id(self, db: Session, destination_id: str) -> MarketGeoValidation | None:
        stmt = select(MarketGeoValidation).where(MarketGeoValidation.destination_id == destination_id)
        return db.execute(stmt).scalar_one_or_none()

    def list(
        self,
        db: Session,
        region_id: str | None = None,
        district: str | None = None,
        tourism_type: str | None = None,
        validation_status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketGeoValidation]]:
        stmt = select(MarketGeoValidation)
        if region_id:
            stmt = stmt.where(MarketGeoValidation.region_id == region_id)
        if district:
            stmt = stmt.where(MarketGeoValidation.district == district)
        if tourism_type:
            stmt = stmt.where(MarketGeoValidation.tourism_type == tourism_type)
        if validation_status:
            stmt = stmt.where(MarketGeoValidation.validation_status == validation_status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(desc(MarketGeoValidation.created_at)).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)

    def update(self, db: Session, destination: MarketGeoValidation) -> MarketGeoValidation:
        db.commit()
        db.refresh(destination)
        return destination
