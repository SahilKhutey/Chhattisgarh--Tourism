from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.modules.market_validation.geo_experiments.models import MarketGeoExperiment, MarketGeoObservation


class GeoExperimentRepository:
    def create_experiment(self, db: Session, exp: MarketGeoExperiment) -> MarketGeoExperiment:
        db.add(exp)
        db.commit()
        db.refresh(exp)
        return exp

    def get_by_key(self, db: Session, key: str) -> MarketGeoExperiment | None:
        stmt = select(MarketGeoExperiment).where(MarketGeoExperiment.experiment_key == key)
        return db.execute(stmt).scalar_one_or_none()

    def get_by_id(self, db: Session, id: UUID) -> MarketGeoExperiment | None:
        return db.get(MarketGeoExperiment, id)

    def list_experiments(
        self,
        db: Session,
        hypothesis_key: str | None = None,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketGeoExperiment]]:
        stmt = select(MarketGeoExperiment)
        if hypothesis_key:
            stmt = stmt.where(MarketGeoExperiment.hypothesis_key == hypothesis_key)
        if status:
            stmt = stmt.where(MarketGeoExperiment.status == status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(desc(MarketGeoExperiment.created_at)).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)

    def update_experiment(self, db: Session, exp: MarketGeoExperiment) -> MarketGeoExperiment:
        db.commit()
        db.refresh(exp)
        return exp

    def create_observation(self, db: Session, obs: MarketGeoObservation) -> MarketGeoObservation:
        db.add(obs)
        db.commit()
        db.refresh(obs)
        return obs

    def list_observations(
        self,
        db: Session,
        task_id: str | None = None,
        relationship_type: str | None = None,
        successful: bool | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketGeoObservation]]:
        stmt = select(MarketGeoObservation)
        if task_id:
            stmt = stmt.where(MarketGeoObservation.task_id == task_id)
        if relationship_type:
            stmt = stmt.where(MarketGeoObservation.relationship_type == relationship_type)
        if successful is not None:
            stmt = stmt.where(MarketGeoObservation.successful == successful)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(desc(MarketGeoObservation.created_at)).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)
