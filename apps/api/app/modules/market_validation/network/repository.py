from __future__ import annotations

from sqlalchemy import select, func, distinct
from sqlalchemy.orm import Session
from app.modules.market_validation.network.models import MarketNetworkInteraction, MarketNetworkGap


class NetworkRepository:
    def create_interaction(self, db: Session, item: MarketNetworkInteraction) -> MarketNetworkInteraction:
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def list_interactions(
        self,
        db: Session,
        actor_type: str | None = None,
        target_type: str | None = None,
        interaction_type: str | None = None,
        geography: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> tuple[int, list[MarketNetworkInteraction]]:
        stmt = select(MarketNetworkInteraction)
        count_stmt = select(func.count(MarketNetworkInteraction.id))

        if actor_type:
            stmt = stmt.where(MarketNetworkInteraction.actor_type == actor_type)
            count_stmt = count_stmt.where(MarketNetworkInteraction.actor_type == actor_type)
        if target_type:
            stmt = stmt.where(MarketNetworkInteraction.target_type == target_type)
            count_stmt = count_stmt.where(MarketNetworkInteraction.target_type == target_type)
        if interaction_type:
            stmt = stmt.where(MarketNetworkInteraction.interaction_type == interaction_type)
            count_stmt = count_stmt.where(MarketNetworkInteraction.interaction_type == interaction_type)
        if geography:
            stmt = stmt.where(MarketNetworkInteraction.geography == geography)
            count_stmt = count_stmt.where(MarketNetworkInteraction.geography == geography)

        total = db.execute(count_stmt).scalar() or 0
        items = db.execute(
            stmt.order_by(MarketNetworkInteraction.created_at.desc()).limit(limit).offset(offset)
        ).scalars().all()

        return total, list(items)

    def count_distinct_actors(self, db: Session, actor_type: str) -> int:
        stmt = select(func.count(distinct(MarketNetworkInteraction.actor_id))).where(
            MarketNetworkInteraction.actor_type == actor_type
        )
        return db.execute(stmt).scalar() or 0

    def count_distinct_targets(self, db: Session, target_type: str) -> int:
        stmt = select(func.count(distinct(MarketNetworkInteraction.target_id))).where(
            MarketNetworkInteraction.target_type == target_type
        )
        return db.execute(stmt).scalar() or 0

    def count_cross_side_edges(self, db: Session, actor_type: str, target_type: str) -> int:
        stmt = select(func.count(distinct(MarketNetworkInteraction.actor_id + ":" + MarketNetworkInteraction.target_id))).where(
            (MarketNetworkInteraction.actor_type == actor_type) & (MarketNetworkInteraction.target_type == target_type)
        )
        return db.execute(stmt).scalar() or 0

    def create_gap(self, db: Session, gap: MarketNetworkGap) -> MarketNetworkGap:
        db.add(gap)
        db.commit()
        db.refresh(gap)
        return gap

    def list_gaps(self, db: Session, geography: str | None = None) -> list[MarketNetworkGap]:
        stmt = select(MarketNetworkGap)
        if geography:
            stmt = stmt.where(MarketNetworkGap.geography == geography)
        return list(db.execute(stmt.order_by(MarketNetworkGap.opportunity_score.desc())).scalars().all())
