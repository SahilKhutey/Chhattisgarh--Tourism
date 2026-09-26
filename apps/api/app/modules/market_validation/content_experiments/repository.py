from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from app.modules.market_validation.content_experiments.models import (
    MarketContentExperiment,
    MarketContentAssignment,
)


class ContentExperimentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, exp: MarketContentExperiment) -> MarketContentExperiment:
        self.db.add(exp)
        self.db.commit()
        self.db.refresh(exp)
        return exp

    def get_by_id(self, exp_id: UUID) -> MarketContentExperiment | None:
        return self.db.query(MarketContentExperiment).filter(MarketContentExperiment.id == exp_id).first()

    def get_by_key(self, exp_key: str) -> MarketContentExperiment | None:
        return self.db.query(MarketContentExperiment).filter(MarketContentExperiment.experiment_key == exp_key).first()

    def list(
        self,
        status: str | None = None,
        hypothesis_key: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[MarketContentExperiment]:
        query = self.db.query(MarketContentExperiment)
        if status:
            query = query.filter(MarketContentExperiment.status == status)
        if hypothesis_key:
            query = query.filter(MarketContentExperiment.hypothesis_key == hypothesis_key)
        return query.order_by(MarketContentExperiment.created_at.desc()).offset(offset).limit(limit).all()

    def count(
        self,
        status: str | None = None,
        hypothesis_key: str | None = None,
    ) -> int:
        query = self.db.query(MarketContentExperiment)
        if status:
            query = query.filter(MarketContentExperiment.status == status)
        if hypothesis_key:
            query = query.filter(MarketContentExperiment.hypothesis_key == hypothesis_key)
        return query.count()

    def update(self, exp: MarketContentExperiment) -> MarketContentExperiment:
        self.db.commit()
        self.db.refresh(exp)
        return exp

    def get_assignment(self, experiment_id: UUID, anonymous_user_id: str) -> MarketContentAssignment | None:
        return (
            self.db.query(MarketContentAssignment)
            .filter(
                MarketContentAssignment.experiment_id == experiment_id,
                MarketContentAssignment.anonymous_user_id == anonymous_user_id,
            )
            .first()
        )

    def create_assignment(self, assignment: MarketContentAssignment) -> MarketContentAssignment:
        self.db.add(assignment)
        self.db.commit()
        self.db.refresh(assignment)
        return assignment
