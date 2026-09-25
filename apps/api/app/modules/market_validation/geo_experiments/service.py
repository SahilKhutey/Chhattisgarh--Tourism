from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.geo_experiments.models import MarketGeoExperiment, MarketGeoObservation
from app.modules.market_validation.geo_experiments.schemas import (
    GeoExperimentCreate,
    GeoExperimentUpdate,
    GeoExperimentResponse,
    GeoObservationCreate,
)
from app.modules.market_validation.geo_experiments.repository import GeoExperimentRepository


class GeoExperimentService:
    def __init__(self, repo: GeoExperimentRepository | None = None):
        self.repo = repo or GeoExperimentRepository()

    def to_response(self, exp: MarketGeoExperiment) -> GeoExperimentResponse:
        lift = 0.0
        if exp.control_metric_value > 0:
            lift = round(
                ((exp.variant_metric_value - exp.control_metric_value) / exp.control_metric_value) * 100.0, 2
            )

        return GeoExperimentResponse(
            id=exp.id,
            experiment_key=exp.experiment_key,
            name=exp.name,
            hypothesis_key=exp.hypothesis_key,
            status=exp.status,
            control_description=exp.control_description,
            variant_description=exp.variant_description,
            primary_metric_name=exp.primary_metric_name,
            control_metric_value=exp.control_metric_value,
            variant_metric_value=exp.variant_metric_value,
            sample_size_control=exp.sample_size_control,
            sample_size_variant=exp.sample_size_variant,
            statistical_significance=exp.statistical_significance,
            outcome=exp.outcome,
            lift_percentage=lift,
            created_at=exp.created_at,
            updated_at=exp.updated_at,
        )

    def create_experiment(self, db: Session, payload: GeoExperimentCreate) -> MarketGeoExperiment:
        existing = self.repo.get_by_key(db, payload.experiment_key)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Experiment key '{payload.experiment_key}' already exists.",
            )

        exp = MarketGeoExperiment(
            id=uuid.uuid4(),
            experiment_key=payload.experiment_key,
            name=payload.name,
            hypothesis_key=payload.hypothesis_key,
            status=payload.status,
            control_description=payload.control_description,
            variant_description=payload.variant_description,
            primary_metric_name=payload.primary_metric_name,
            control_metric_value=payload.control_metric_value,
            variant_metric_value=payload.variant_metric_value,
            sample_size_control=payload.sample_size_control,
            sample_size_variant=payload.sample_size_variant,
            statistical_significance=payload.statistical_significance,
            outcome=payload.outcome,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        return self.repo.create_experiment(db, exp)

    def get_experiment(self, db: Session, experiment_id: uuid.UUID) -> MarketGeoExperiment:
        exp = self.repo.get_by_id(db, experiment_id)
        if not exp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Experiment '{experiment_id}' not found.",
            )
        return exp

    def get_experiment_by_key(self, db: Session, key: str) -> MarketGeoExperiment:
        exp = self.repo.get_by_key(db, key)
        if not exp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Experiment key '{key}' not found.",
            )
        return exp

    def list_experiments(
        self,
        db: Session,
        hypothesis_key: str | None = None,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketGeoExperiment]]:
        return self.repo.list_experiments(
            db, hypothesis_key=hypothesis_key, status=status, limit=limit, offset=offset
        )

    def update_experiment(
        self,
        db: Session,
        experiment_id: uuid.UUID,
        payload: GeoExperimentUpdate,
    ) -> MarketGeoExperiment:
        exp = self.get_experiment(db, experiment_id)
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(exp, field, value)

        exp.updated_at = datetime.now(timezone.utc)
        return self.repo.update_experiment(db, exp)

    def record_observation(self, db: Session, payload: GeoObservationCreate) -> MarketGeoObservation:
        obs = MarketGeoObservation(
            id=uuid.uuid4(),
            participant_id=payload.participant_id,
            task_id=payload.task_id,
            source_place_id=payload.source_place_id,
            target_place_id=payload.target_place_id,
            relationship_type=payload.relationship_type,
            expected_relationship=payload.expected_relationship,
            observed_behavior=payload.observed_behavior,
            successful=payload.successful,
            difficulty=payload.difficulty,
            confidence=payload.confidence,
            evidence_type=payload.evidence_type,
            created_at=datetime.now(timezone.utc),
        )
        return self.repo.create_observation(db, obs)

    def list_observations(
        self,
        db: Session,
        task_id: str | None = None,
        relationship_type: str | None = None,
        successful: bool | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketGeoObservation]]:
        return self.repo.list_observations(
            db,
            task_id=task_id,
            relationship_type=relationship_type,
            successful=successful,
            limit=limit,
            offset=offset,
        )
