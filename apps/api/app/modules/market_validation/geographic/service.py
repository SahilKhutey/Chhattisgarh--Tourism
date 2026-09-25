from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.geographic.models import MarketGeoValidation
from app.modules.market_validation.geographic.schemas import (
    GeoDestinationCreate,
    GeoDestinationUpdate,
)
from app.modules.market_validation.geographic.repository import GeoRepository


class GeoService:
    def __init__(self, repo: GeoRepository | None = None):
        self.repo = repo or GeoRepository()

    def create_destination(self, db: Session, payload: GeoDestinationCreate) -> MarketGeoValidation:
        existing = self.repo.get_by_destination_id(db, payload.destination_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Destination ID '{payload.destination_id}' already exists.",
            )

        # Validate coordinates quality if present
        if payload.latitude is not None and (payload.latitude < -90 or payload.latitude > 90):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid latitude {payload.latitude}. Must be between -90 and 90.",
            )
        if payload.longitude is not None and (payload.longitude < -180 or payload.longitude > 180):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid longitude {payload.longitude}. Must be between -180 and 180.",
            )

        destination = MarketGeoValidation(
            id=uuid.uuid4(),
            region_id=payload.region_id,
            zone_id=payload.zone_id,
            destination_id=payload.destination_id,
            destination_name=payload.destination_name,
            district=payload.district,
            latitude=payload.latitude,
            longitude=payload.longitude,
            tourism_type=payload.tourism_type,
            validation_status=payload.validation_status,
            evidence_count=payload.evidence_count,
            confidence=payload.confidence,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        return self.repo.create(db, destination)

    def get_destination(self, db: Session, destination_id: str) -> MarketGeoValidation:
        dest = self.repo.get_by_destination_id(db, destination_id)
        if not dest:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Destination '{destination_id}' not found.",
            )
        return dest

    def list_destinations(
        self,
        db: Session,
        region_id: str | None = None,
        district: str | None = None,
        tourism_type: str | None = None,
        validation_status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketGeoValidation]]:
        return self.repo.list(
            db,
            region_id=region_id,
            district=district,
            tourism_type=tourism_type,
            validation_status=validation_status,
            limit=limit,
            offset=offset,
        )

    def update_destination(
        self,
        db: Session,
        destination_id: str,
        payload: GeoDestinationUpdate,
    ) -> MarketGeoValidation:
        dest = self.get_destination(db, destination_id)
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(dest, field, value)

        dest.updated_at = datetime.now(timezone.utc)
        return self.repo.update(db, dest)
