from __future__ import annotations

from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.modules.market_validation.business_model.models import MarketBusinessModel, MarketRevenueStream


class BusinessModelRepository:
    def create_model(self, db: Session, item: MarketBusinessModel) -> MarketBusinessModel:
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def get_model_by_id(self, db: Session, model_id: str) -> MarketBusinessModel | None:
        stmt = select(MarketBusinessModel).where(MarketBusinessModel.id == str(model_id))
        return db.execute(stmt).scalars().first()

    def list_models(
        self,
        db: Session,
        customer_type: str | None = None,
        revenue_model: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketBusinessModel]]:
        stmt = select(MarketBusinessModel)
        count_stmt = select(func.count(MarketBusinessModel.id))

        if customer_type:
            stmt = stmt.where(MarketBusinessModel.customer_type == customer_type)
            count_stmt = count_stmt.where(MarketBusinessModel.customer_type == customer_type)
        if revenue_model:
            stmt = stmt.where(MarketBusinessModel.revenue_model == revenue_model)
            count_stmt = count_stmt.where(MarketBusinessModel.revenue_model == revenue_model)

        total = db.execute(count_stmt).scalar() or 0
        items = db.execute(
            stmt.order_by(MarketBusinessModel.created_at.desc()).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)

    def create_revenue_stream(self, db: Session, item: MarketRevenueStream) -> MarketRevenueStream:
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def get_stream_by_id(self, db: Session, stream_id: str) -> MarketRevenueStream | None:
        stmt = select(MarketRevenueStream).where(MarketRevenueStream.id == str(stream_id))
        return db.execute(stmt).scalars().first()

    def list_revenue_streams(
        self,
        db: Session,
        customer_type: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketRevenueStream]]:
        stmt = select(MarketRevenueStream)
        count_stmt = select(func.count(MarketRevenueStream.id))

        if customer_type:
            stmt = stmt.where(MarketRevenueStream.customer_type == customer_type)
            count_stmt = count_stmt.where(MarketRevenueStream.customer_type == customer_type)

        total = db.execute(count_stmt).scalar() or 0
        items = db.execute(
            stmt.order_by(MarketRevenueStream.created_at.desc()).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)
