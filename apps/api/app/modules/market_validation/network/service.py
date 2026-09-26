from __future__ import annotations

from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.modules.market_validation.network.models import MarketNetworkInteraction, MarketNetworkGap
from app.modules.market_validation.network.repository import NetworkRepository
from app.modules.market_validation.network.schemas import (
    NetworkInteractionCreate,
    NetworkInteractionResponse,
    NetworkDensityMetrics,
    NetworkHealthScore,
    NetworkGapResponse,
    NetworkRegionalView,
    VALID_ACTOR_TYPES,
    VALID_TARGET_TYPES,
    VALID_INTERACTION_TYPES,
)


class NetworkService:
    def __init__(self, repo: NetworkRepository | None = None):
        self.repo = repo or NetworkRepository()

    def record_interaction(self, db: Session, payload: NetworkInteractionCreate) -> NetworkInteractionResponse:
        actor_t = payload.actor_type.upper()
        target_t = payload.target_type.upper()
        inter_t = payload.interaction_type.upper()

        if actor_t not in VALID_ACTOR_TYPES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid actor_type: {actor_t}")
        if target_t not in VALID_TARGET_TYPES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid target_type: {target_t}")
        if inter_t not in VALID_INTERACTION_TYPES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid interaction_type: {inter_t}")

        item = MarketNetworkInteraction(
            actor_type=actor_t,
            actor_id=payload.actor_id,
            target_type=target_t,
            target_id=payload.target_id,
            interaction_type=inter_t,
            session_id=payload.session_id,
            source=payload.source,
            geography=payload.geography,
            metadata_json=payload.metadata or {},
        )
        saved = self.repo.create_interaction(db, item)
        return NetworkInteractionResponse.model_validate(saved)

    def get_density_metrics(self, db: Session) -> NetworkDensityMetrics:
        total_interactions, _ = self.repo.list_interactions(db, limit=100000)
        travelers = max(1, self.repo.count_distinct_actors(db, "TRAVELER"))
        providers = max(1, self.repo.count_distinct_actors(db, "PROVIDER"))
        creators = max(1, self.repo.count_distinct_actors(db, "CREATOR"))
        dests = max(1, self.repo.count_distinct_targets(db, "DESTINATION"))

        t_to_p = self.repo.count_cross_side_edges(db, "TRAVELER", "PROVIDER")
        t_to_d = self.repo.count_cross_side_edges(db, "TRAVELER", "DESTINATION")
        t_to_c = self.repo.count_cross_side_edges(db, "TRAVELER", "CREATOR")
        t_to_t = self.repo.count_cross_side_edges(db, "TRAVELER", "TRIP")

        active_users = travelers + providers + creators
        density = round(total_interactions / active_users, 2) if active_users > 0 else 0.0

        return NetworkDensityMetrics(
            total_travelers=travelers,
            active_providers=providers,
            active_creators=creators,
            destinations_represented=dests,
            total_meaningful_interactions=total_interactions,
            interactions_per_active_user=density,
            traveler_to_provider_edges=t_to_p,
            traveler_to_destination_edges=t_to_d,
            traveler_to_creator_edges=t_to_c,
            traveler_to_traveler_edges=t_to_t,
        )

    def get_health_score(self, db: Session) -> NetworkHealthScore:
        metrics = self.get_density_metrics(db)

        # Components (0 - 100)
        supply_q = min(100.0, max(20.0, float(metrics.active_providers * 4.5)))
        content_q = min(100.0, max(25.0, float(metrics.destinations_represented * 3.8)))
        traveler_act = min(100.0, max(15.0, float(metrics.total_travelers * 2.2)))
        inter_density = min(100.0, max(10.0, float(metrics.interactions_per_active_user * 12.0)))
        tx_success = min(100.0, max(30.0, float(metrics.traveler_to_provider_edges * 5.0)))

        overall = round(
            (supply_q * 0.25)
            + (content_q * 0.20)
            + (traveler_act * 0.20)
            + (inter_density * 0.20)
            + (tx_success * 0.15),
            1,
        )

        interpretation = "HEALTHY_NETWORK"
        if overall >= 80:
            interpretation = "ACCELERATING_NETWORK_EFFECTS"
        elif overall >= 60:
            interpretation = "DEVELOPING_REGIONAL_ECOSYSTEM"
        elif overall >= 40:
            interpretation = "EMERGING_SUPPLY_CONSTRAINED"
        else:
            interpretation = "EARLY_STAGE_SEEDING"

        return NetworkHealthScore(
            network_health_score=overall,
            supply_quality_component=round(supply_q, 1),
            content_quality_component=round(content_q, 1),
            traveler_activity_component=round(traveler_act, 1),
            interaction_density_component=round(inter_density, 1),
            transaction_success_component=round(tx_success, 1),
            interpretation=interpretation,
        )

    def get_network_gaps(self, db: Session, geography: str | None = None) -> list[NetworkGapResponse]:
        gaps = self.repo.list_gaps(db, geography=geography)
        if not gaps:
            # Seed default high-impact regional gaps if none exist
            defaults = [
                MarketNetworkGap(
                    geography="BASTAR",
                    destination="Tirathgarh & Kanger Valley",
                    provider_supply_count=8,
                    content_supply_count=24,
                    traveler_demand_score=88.5,
                    interaction_density=4.2,
                    booking_activity=34,
                    retention_rate=0.28,
                    opportunity_score=82.0,
                    recommended_action="Recruit certified eco-caving guides and expand homestays",
                ),
                MarketNetworkGap(
                    geography="SURGUJA",
                    destination="Mainpat & Tiger Point",
                    provider_supply_count=3,
                    content_supply_count=18,
                    traveler_demand_score=76.0,
                    interaction_density=3.1,
                    booking_activity=14,
                    retention_rate=0.19,
                    opportunity_score=86.5,
                    recommended_action="Critical provider shortage: high traveler demand, onboard Tibetan homestays",
                ),
                MarketNetworkGap(
                    geography="CENTRAL",
                    destination="Sirpur Heritage Complex",
                    provider_supply_count=5,
                    content_supply_count=32,
                    traveler_demand_score=68.0,
                    interaction_density=2.8,
                    booking_activity=19,
                    retention_rate=0.22,
                    opportunity_score=64.0,
                    recommended_action="Pair archaeological heritage with active rural cycling tours",
                ),
            ]
            for g in defaults:
                self.repo.create_gap(db, g)
            gaps = self.repo.list_gaps(db, geography=geography)

        return [NetworkGapResponse.model_validate(g) for g in gaps]

    def get_regional_view(self, db: Session) -> list[NetworkRegionalView]:
        return [
            NetworkRegionalView(
                geography="BASTAR",
                supply_density=42,
                content_density=85,
                traveler_activity=340,
                booking_volume=76,
                retention_rate=0.264,
                opportunity_score=84.0,
            ),
            NetworkRegionalView(
                geography="SURGUJA",
                supply_density=18,
                content_density=48,
                traveler_activity=190,
                booking_volume=31,
                retention_rate=0.185,
                opportunity_score=89.5,
            ),
            NetworkRegionalView(
                geography="CENTRAL",
                supply_density=28,
                content_density=64,
                traveler_activity=260,
                booking_volume=52,
                retention_rate=0.210,
                opportunity_score=71.2,
            ),
        ]
