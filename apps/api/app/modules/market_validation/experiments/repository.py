from __future__ import annotations

from sqlalchemy.orm import Session
from app.modules.market_validation.experiments.models import MarketBusinessExperimentObservation
from app.modules.market_validation.experiments.schemas import ObservationCreate


class ExperimentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_observation(self, data: ObservationCreate) -> MarketBusinessExperimentObservation:
        obs = MarketBusinessExperimentObservation(
            experiment_id=data.experiment_id,
            participant_id=data.participant_id,
            variant=data.variant,
            offer=data.offer,
            observed_action=data.observed_action,
            price=data.price,
            committed=data.committed,
            paid=data.paid,
            outcome=data.outcome,
            evidence=data.evidence,
        )
        self.db.add(obs)
        self.db.commit()
        self.db.refresh(obs)
        return obs

    def get_observation(self, obs_id: str) -> MarketBusinessExperimentObservation | None:
        return self.db.query(MarketBusinessExperimentObservation).filter(
            MarketBusinessExperimentObservation.id == obs_id
        ).first()

    def list_observations(
        self,
        experiment_id: str | None = None,
        variant: str | None = None,
        limit: int = 200,
        offset: int = 0,
    ) -> list[MarketBusinessExperimentObservation]:
        query = self.db.query(MarketBusinessExperimentObservation)
        if experiment_id:
            query = query.filter(MarketBusinessExperimentObservation.experiment_id == experiment_id)
        if variant:
            query = query.filter(MarketBusinessExperimentObservation.variant == variant)
        return query.order_by(MarketBusinessExperimentObservation.created_at.desc()).offset(offset).limit(limit).all()
