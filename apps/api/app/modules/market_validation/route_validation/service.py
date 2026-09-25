from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.route_validation.models import MarketRouteValidation
from app.modules.market_validation.route_validation.schemas import (
    RouteValidationCreate,
)
from app.modules.market_validation.route_validation.repository import RouteValidationRepository


class RouteValidationService:
    def __init__(self, repo: RouteValidationRepository | None = None):
        self.repo = repo or RouteValidationRepository()

    def validate_and_record_route(self, db: Session, payload: RouteValidationCreate) -> MarketRouteValidation:
        # Feasibility check: if driving time exceeds 14 hours in a single continuous segment without overnight intermediate
        feasibility = payload.feasibility
        if payload.estimated_duration_minutes > 840 and not payload.intermediate_places:
            feasibility = "UNREALISTIC"
        elif payload.estimated_duration_minutes > 600:
            feasibility = "DIFFICULT"

        route = MarketRouteValidation(
            id=uuid.uuid4(),
            origin=payload.origin,
            destination=payload.destination,
            intermediate_places=payload.intermediate_places,
            estimated_duration_minutes=payload.estimated_duration_minutes,
            actual_or_user_estimate_minutes=payload.actual_or_user_estimate_minutes,
            travel_mode=payload.travel_mode,
            feasibility=feasibility,
            participant_id=payload.participant_id,
            evidence=payload.evidence,
            created_at=datetime.now(timezone.utc),
        )
        return self.repo.create(db, route)

    def list_routes(
        self,
        db: Session,
        origin: str | None = None,
        destination: str | None = None,
        feasibility: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketRouteValidation]]:
        return self.repo.list(
            db, origin=origin, destination=destination, feasibility=feasibility, limit=limit, offset=offset
        )
