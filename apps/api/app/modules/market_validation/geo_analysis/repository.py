from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.modules.market_validation.geo_analysis.models import MarketGeoMetric
from app.modules.market_validation.geographic.models import MarketGeoValidation
from app.modules.market_validation.geo_relationships.models import MarketGeoRelationship
from app.modules.market_validation.route_validation.models import MarketRouteValidation
from app.modules.market_validation.geo_experiments.models import MarketGeoObservation


class GeoAnalysisRepository:
    def get_or_create_metric(self, db: Session, region_id: str) -> MarketGeoMetric:
        stmt = select(MarketGeoMetric).where(MarketGeoMetric.region_id == region_id)
        metric = db.execute(stmt).scalar_one_or_none()
        if not metric:
            metric = MarketGeoMetric(
                region_id=region_id,
                total_destinations=0,
                total_relationships=0,
                validated_relationships=0,
                nearby_planning_activation_rate=0.0,
                discovery_expansion_rate=0.0,
                route_conversion_rate=0.0,
                avg_planning_efficiency=0.0,
                geographic_utility_score=0.0,
            )
            db.add(metric)
            db.commit()
            db.refresh(metric)
        return metric

    def update_metric(self, db: Session, metric: MarketGeoMetric) -> MarketGeoMetric:
        db.commit()
        db.refresh(metric)
        return metric

    def get_destination_count(self, db: Session, region_id: str | None = None) -> int:
        stmt = select(func.count(MarketGeoValidation.id))
        if region_id and region_id != "ALL":
            stmt = stmt.where(MarketGeoValidation.region_id == region_id)
        return db.execute(stmt).scalar_one() or 0

    def get_relationship_counts(self, db: Session) -> dict[str, int]:
        total = db.execute(select(func.count(MarketGeoRelationship.id))).scalar_one() or 0
        validated = db.execute(
            select(func.count(MarketGeoRelationship.id)).where(MarketGeoRelationship.validation_status == "VALIDATED")
        ).scalar_one() or 0
        provisional = db.execute(
            select(func.count(MarketGeoRelationship.id)).where(MarketGeoRelationship.validation_status == "PROVISIONAL")
        ).scalar_one() or 0
        invalidated = db.execute(
            select(func.count(MarketGeoRelationship.id)).where(MarketGeoRelationship.validation_status == "INVALIDATED")
        ).scalar_one() or 0

        return {
            "total": total,
            "validated": validated,
            "uncertain": provisional,
            "invalidated": invalidated,
        }

    def get_route_counts(self, db: Session) -> dict:
        total = db.execute(select(func.count(MarketRouteValidation.id))).scalar_one() or 0
        feasible = db.execute(
            select(func.count(MarketRouteValidation.id)).where(MarketRouteValidation.feasibility == "FEASIBLE")
        ).scalar_one() or 0
        difficult = db.execute(
            select(func.count(MarketRouteValidation.id)).where(MarketRouteValidation.feasibility == "DIFFICULT")
        ).scalar_one() or 0
        unrealistic = db.execute(
            select(func.count(MarketRouteValidation.id)).where(MarketRouteValidation.feasibility == "UNREALISTIC")
        ).scalar_one() or 0

        avg_dur_stmt = select(func.avg(MarketRouteValidation.estimated_duration_minutes))
        avg_dur = db.execute(avg_dur_stmt).scalar_one() or 0.0

        return {
            "total": total,
            "feasible": feasible,
            "difficult": difficult,
            "unrealistic": unrealistic,
            "avg_duration": float(avg_dur),
        }

    def get_observations(self, db: Session) -> list[MarketGeoObservation]:
        return list(db.execute(select(MarketGeoObservation)).scalars().all())
