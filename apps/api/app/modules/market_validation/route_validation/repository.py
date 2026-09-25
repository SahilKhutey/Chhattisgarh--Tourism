from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.modules.market_validation.route_validation.models import MarketRouteValidation


class RouteValidationRepository:
    def create(self, db: Session, route: MarketRouteValidation) -> MarketRouteValidation:
        db.add(route)
        db.commit()
        db.refresh(route)
        return route

    def get_by_id(self, db: Session, id: UUID) -> MarketRouteValidation | None:
        return db.get(MarketRouteValidation, id)

    def list(
        self,
        db: Session,
        origin: str | None = None,
        destination: str | None = None,
        feasibility: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketRouteValidation]]:
        stmt = select(MarketRouteValidation)
        if origin:
            stmt = stmt.where(MarketRouteValidation.origin.ilike(f"%{origin}%"))
        if destination:
            stmt = stmt.where(MarketRouteValidation.destination.ilike(f"%{destination}%"))
        if feasibility:
            stmt = stmt.where(MarketRouteValidation.feasibility == feasibility)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(desc(MarketRouteValidation.created_at)).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)
