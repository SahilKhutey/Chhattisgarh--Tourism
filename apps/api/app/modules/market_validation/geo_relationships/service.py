from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.geo_relationships.models import MarketGeoRelationship
from app.modules.market_validation.geographic.models import MarketGeoValidation
from app.modules.market_validation.geo_relationships.schemas import (
    GeoRelationshipCreate,
    GeoRelationshipUpdate,
    NearbyPlaceItem,
    NearbyPlacesResponse,
    GeoRelevanceBreakdown,
)
from app.modules.market_validation.geo_relationships.repository import GeoRelationshipRepository
from app.modules.market_validation.geographic.repository import GeoRepository
from app.modules.search.geo import haversine_km


class GeoRelationshipService:
    def __init__(
        self,
        repo: GeoRelationshipRepository | None = None,
        geo_repo: GeoRepository | None = None,
    ):
        self.repo = repo or GeoRelationshipRepository()
        self.geo_repo = geo_repo or GeoRepository()

    def create_relationship(self, db: Session, payload: GeoRelationshipCreate) -> MarketGeoRelationship:
        src = self.geo_repo.get_by_destination_id(db, payload.source_destination_id)
        if not src:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source destination '{payload.source_destination_id}' not found.",
            )
        tgt = self.geo_repo.get_by_destination_id(db, payload.target_destination_id)
        if not tgt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Target destination '{payload.target_destination_id}' not found.",
            )

        existing = self.repo.find_existing(
            db, payload.source_destination_id, payload.target_destination_id, payload.relationship_type
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Relationship '{payload.relationship_type}' from '{payload.source_destination_id}' "
                    f"to '{payload.target_destination_id}' already exists."
                ),
            )

        straight_km = payload.straight_line_km
        if straight_km is None and src.latitude and src.longitude and tgt.latitude and tgt.longitude:
            straight_km = round(haversine_km(src.latitude, src.longitude, tgt.latitude, tgt.longitude), 2)

        road_km = payload.road_distance_km
        if road_km is None and straight_km is not None:
            # Rule of thumb for regional terrain: road distance is ~1.25x straight line
            road_km = round(straight_km * 1.25, 2)

        est_minutes = payload.estimated_travel_minutes
        if est_minutes is None and road_km is not None:
            # Average travel speed in regional roads: ~40 km/h
            est_minutes = max(5, int((road_km / 40.0) * 60))

        relationship = MarketGeoRelationship(
            id=uuid.uuid4(),
            source_destination_id=payload.source_destination_id,
            target_destination_id=payload.target_destination_id,
            relationship_type=payload.relationship_type,
            straight_line_km=straight_km,
            road_distance_km=road_km,
            estimated_travel_minutes=est_minutes,
            validation_status=payload.validation_status,
            evidence_type=payload.evidence_type,
            evidence_count=payload.evidence_count,
            confidence=payload.confidence,
            source=payload.source,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        return self.repo.create(db, relationship)

    def get_relationship(self, db: Session, relationship_id: uuid.UUID) -> MarketGeoRelationship:
        rel = self.repo.get_by_id(db, relationship_id)
        if not rel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Relationship '{relationship_id}' not found.",
            )
        return rel

    def list_relationships(
        self,
        db: Session,
        source_id: str | None = None,
        target_id: str | None = None,
        relationship_type: str | None = None,
        validation_status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketGeoRelationship]]:
        return self.repo.list(
            db,
            source_id=source_id,
            target_id=target_id,
            relationship_type=relationship_type,
            validation_status=validation_status,
            limit=limit,
            offset=offset,
        )

    def update_relationship(
        self,
        db: Session,
        relationship_id: uuid.UUID,
        payload: GeoRelationshipUpdate,
    ) -> MarketGeoRelationship:
        rel = self.get_relationship(db, relationship_id)
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(rel, field, value)

        rel.updated_at = datetime.now(timezone.utc)
        return self.repo.update(db, rel)

    @staticmethod
    def calculate_relevance_score(
        distance_km: float,
        travel_time_minutes: int,
        confidence: float,
        is_same_district: bool = True,
    ) -> tuple[int, GeoRelevanceBreakdown]:
        dist_score = max(0, min(25, int(25 - (distance_km * 0.25))))
        time_score = max(0, min(25, int(25 - (travel_time_minutes * 0.15))))
        route_comp = 15 if is_same_district else 10
        exp_comp = int(15 * confidence)
        pop_score = 10
        interest_match = 10

        total = dist_score + time_score + route_comp + exp_comp + pop_score + interest_match
        normalized = max(0, min(100, total))

        breakdown = GeoRelevanceBreakdown(
            distance_score=dist_score,
            travel_time_score=time_score,
            route_compatibility=route_comp,
            experience_compatibility=exp_comp,
            destination_popularity=pop_score,
            user_interest_match=interest_match,
        )
        return normalized, breakdown

    def get_nearby_places(
        self,
        db: Session,
        destination_id: str,
        radius_km: float = 50.0,
        relationship_type: str | None = None,
        sort_by: str = "relevance",  # "relevance" or "distance"
        limit: int = 20,
    ) -> NearbyPlacesResponse:
        src = self.geo_repo.get_by_destination_id(db, destination_id)
        if not src:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source destination '{destination_id}' not found.",
            )

        # Get all destinations in same region or statewide
        _, all_destinations = self.geo_repo.list(db, limit=200)

        # Get existing relationships for extra context
        existing_rels = self.repo.get_related(db, destination_id, relationship_type)
        rel_map: dict[str, MarketGeoRelationship] = {}
        for r in existing_rels:
            other_id = r.target_destination_id if r.source_destination_id == destination_id else r.source_destination_id
            rel_map[other_id] = r

        results: list[NearbyPlaceItem] = []
        for dest in all_destinations:
            if dest.destination_id == destination_id:
                continue

            dist_km: float | None = None
            if src.latitude and src.longitude and dest.latitude and dest.longitude:
                dist_km = round(haversine_km(src.latitude, src.longitude, dest.latitude, dest.longitude), 2)

            rel = rel_map.get(dest.destination_id)
            if dist_km is None and rel and rel.straight_line_km:
                dist_km = rel.straight_line_km

            if dist_km is not None and dist_km <= radius_km:
                travel_mins = (
                    rel.estimated_travel_minutes
                    if rel and rel.estimated_travel_minutes
                    else max(5, int((dist_km * 1.25 / 40.0) * 60))
                )
                rel_type = rel.relationship_type if rel else "NEARBY"
                conf = rel.confidence if rel else dest.confidence

                rel_score, breakdown = self.calculate_relevance_score(
                    dist_km, travel_mins, conf, is_same_district=(src.district == dest.district)
                )

                results.append(
                    NearbyPlaceItem(
                        destination_id=dest.destination_id,
                        destination_name=dest.destination_name,
                        tourism_type=dest.tourism_type,
                        district=dest.district,
                        latitude=dest.latitude,
                        longitude=dest.longitude,
                        distance_km=dist_km,
                        travel_time_minutes=travel_mins,
                        relationship_type=rel_type,
                        confidence=conf,
                        geo_relevance_score=rel_score,
                        relevance_breakdown=breakdown,
                    )
                )

        if sort_by == "distance":
            results.sort(key=lambda x: x.distance_km)
        else:
            results.sort(key=lambda x: (x.geo_relevance_score, -x.distance_km), reverse=True)

        results = results[:limit]
        return NearbyPlacesResponse(
            source_destination_id=destination_id,
            radius_km=radius_km,
            total=len(results),
            places=results,
        )
