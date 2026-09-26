from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modules.market_validation.content_experiments.models import (
    MarketContentExperiment,
    MarketContentAssignment,
)
from app.modules.market_validation.content_experiments.repository import ContentExperimentRepository
from app.modules.market_validation.content_experiments.schemas import (
    ContentExperimentCreate,
    ContentExperimentUpdate,
    AssignmentResponse,
)


class ContentExperimentService:
    def __init__(self, db: Session):
        self.repo = ContentExperimentRepository(db)

    @staticmethod
    def calculate_lift(control_val: float, variant_val: float) -> float:
        if control_val > 0.0:
            return round(((variant_val - control_val) / control_val) * 100.0, 2)
        return 0.0

    def create_experiment(self, data: ContentExperimentCreate) -> MarketContentExperiment:
        existing = self.repo.get_by_key(data.experiment_key)
        if existing:
            raise HTTPException(status_code=409, detail=f"Experiment '{data.experiment_key}' already exists.")

        lift = self.calculate_lift(data.control_metric_value, data.variant_metric_value)

        exp = MarketContentExperiment(
            experiment_key=data.experiment_key,
            name=data.name,
            hypothesis_key=data.hypothesis_key,
            content_entry_id=data.content_entry_id,
            status=data.status,
            control_version=data.control_version,
            variant_version=data.variant_version,
            audience=data.audience,
            primary_metric=data.primary_metric,
            secondary_metrics=data.secondary_metrics,
            control_metric_value=data.control_metric_value,
            variant_metric_value=data.variant_metric_value,
            sample_size_control=data.sample_size_control,
            sample_size_variant=data.sample_size_variant,
            lift_percentage=lift,
            outcome=data.outcome,
        )
        return self.repo.create(exp)

    def get_experiment(self, exp_id: UUID) -> MarketContentExperiment:
        exp = self.repo.get_by_id(exp_id)
        if not exp:
            raise HTTPException(status_code=404, detail="Content experiment not found.")
        return exp

    def get_experiment_by_key(self, exp_key: str) -> MarketContentExperiment:
        exp = self.repo.get_by_key(exp_key)
        if not exp:
            raise HTTPException(status_code=404, detail="Content experiment not found.")
        return exp

    def update_experiment(self, exp_id: UUID, data: ContentExperimentUpdate) -> MarketContentExperiment:
        exp = self.get_experiment(exp_id)
        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(exp, key, value)

        exp.lift_percentage = self.calculate_lift(exp.control_metric_value, exp.variant_metric_value)
        return self.repo.update(exp)

    def list_experiments(
        self,
        status: str | None = None,
        hypothesis_key: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> tuple[int, list[MarketContentExperiment]]:
        total = self.repo.count(status=status, hypothesis_key=hypothesis_key)
        items = self.repo.list(status=status, hypothesis_key=hypothesis_key, limit=limit, offset=offset)
        return total, items

    def assign_user(self, exp_id: UUID, anonymous_user_id: str) -> AssignmentResponse:
        exp = self.get_experiment(exp_id)

        # Check existing assignment
        existing = self.repo.get_assignment(exp.id, anonymous_user_id)
        if existing:
            content = exp.control_version if existing.assigned_variant == "CONTROL" else exp.variant_version
            return AssignmentResponse(
                experiment_id=exp.id,
                experiment_key=exp.experiment_key,
                anonymous_user_id=anonymous_user_id,
                assigned_variant=existing.assigned_variant,
                assigned_content=content,
                assigned_at=existing.assigned_at,
            )

        # Deterministic assignment using MD5 hash modulo 2
        hash_digest = hashlib.md5(f"{exp.id}:{anonymous_user_id}".encode()).hexdigest()
        variant_name = "CONTROL" if int(hash_digest[-1], 16) % 2 == 0 else "VARIANT"

        assignment = MarketContentAssignment(
            experiment_id=exp.id,
            anonymous_user_id=anonymous_user_id,
            assigned_variant=variant_name,
            assigned_at=datetime.now(timezone.utc),
        )
        saved = self.repo.create_assignment(assignment)

        # Increment sample size
        if variant_name == "CONTROL":
            exp.sample_size_control += 1
        else:
            exp.sample_size_variant += 1
        self.repo.update(exp)

        content = exp.control_version if variant_name == "CONTROL" else exp.variant_version
        return AssignmentResponse(
            experiment_id=exp.id,
            experiment_key=exp.experiment_key,
            anonymous_user_id=anonymous_user_id,
            assigned_variant=variant_name,
            assigned_content=content,
            assigned_at=saved.assigned_at,
        )
