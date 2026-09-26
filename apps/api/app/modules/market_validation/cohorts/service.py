from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.modules.market_validation.cohorts.models import MarketRetentionCohort
from app.modules.market_validation.cohorts.repository import CohortRepository
from app.modules.market_validation.cohorts.schemas import (
    CohortCreate,
    CohortUpdateMetrics,
    CohortResponse,
    CohortListResponse,
)


class CohortService:
    def __init__(self, repo: CohortRepository | None = None):
        self.repo = repo or CohortRepository()

    def create_cohort(self, db: Session, payload: CohortCreate) -> CohortResponse:
        cohort = MarketRetentionCohort(
            cohort_date=payload.cohort_date,
            acquisition_source=payload.acquisition_source,
            first_action=payload.first_action,
            first_destination=payload.first_destination,
            segment=payload.segment,
            traveler_type=payload.traveler_type,
            geography=payload.geography,
            cohort_size=payload.cohort_size,
            metadata_json=payload.metadata or {},
        )
        saved = self.repo.create(db, cohort)
        return self._to_response(saved)

    def get_cohort(self, db: Session, cohort_id: str) -> CohortResponse:
        cohort = self.repo.get_by_id(db, cohort_id)
        if not cohort:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cohort '{cohort_id}' not found.",
            )
        return self._to_response(cohort)

    def update_metrics(self, db: Session, cohort_id: str, payload: CohortUpdateMetrics) -> CohortResponse:
        cohort = self.repo.get_by_id(db, cohort_id)
        if not cohort:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cohort '{cohort_id}' not found.",
            )

        update_data = payload.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            if val is not None:
                setattr(cohort, key, val)

        saved = self.repo.update(db, cohort)
        return self._to_response(saved)

    def list_cohorts(
        self,
        db: Session,
        acquisition_source: str | None = None,
        geography: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> CohortListResponse:
        total, items = self.repo.list(
            db,
            acquisition_source=acquisition_source,
            geography=geography,
            limit=limit,
            offset=offset,
        )
        return CohortListResponse(
            total=total,
            items=[self._to_response(c) for c in items],
        )

    def _to_response(self, c: MarketRetentionCohort) -> CohortResponse:
        size = max(1, c.cohort_size) if c.cohort_size > 0 else 1
        d1_rate = round(c.d1_retained / size, 4) if c.cohort_size > 0 else 0.0
        d7_rate = round(c.d7_retained / size, 4) if c.cohort_size > 0 else 0.0
        d30_rate = round(c.d30_retained / size, 4) if c.cohort_size > 0 else 0.0
        tc_rate = round(c.trip_cycle_retained / size, 4) if c.cohort_size > 0 else 0.0
        nt_rate = round(c.next_trip_count / size, 4) if c.cohort_size > 0 else 0.0
        exp_rate = round(c.destinations_expanded_count / size, 4) if c.cohort_size > 0 else 0.0

        return CohortResponse(
            id=c.id,
            cohort_date=c.cohort_date,
            acquisition_source=c.acquisition_source,
            first_action=c.first_action,
            first_destination=c.first_destination,
            segment=c.segment,
            traveler_type=c.traveler_type,
            geography=c.geography,
            cohort_size=c.cohort_size,
            d1_retained=c.d1_retained,
            d7_retained=c.d7_retained,
            d30_retained=c.d30_retained,
            trip_cycle_retained=c.trip_cycle_retained,
            next_trip_count=c.next_trip_count,
            destinations_expanded_count=c.destinations_expanded_count,
            d1_rate=d1_rate,
            d7_rate=d7_rate,
            d30_rate=d30_rate,
            trip_cycle_rate=tc_rate,
            next_trip_rate=nt_rate,
            destination_expansion_rate=exp_rate,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
