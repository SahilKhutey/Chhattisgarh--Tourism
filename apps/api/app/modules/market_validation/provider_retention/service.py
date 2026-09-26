from __future__ import annotations

from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.modules.market_validation.provider_retention.models import MarketProviderRetention
from app.modules.market_validation.provider_retention.repository import ProviderRetentionRepository
from app.modules.market_validation.provider_retention.schemas import (
    ProviderActivityRecord,
    ProviderRetentionResponse,
    ProviderRetentionOverview,
    ProviderSupplyDensityMetrics,
)


class ProviderRetentionService:
    def __init__(self, repo: ProviderRetentionRepository | None = None):
        self.repo = repo or ProviderRetentionRepository()

    def record_activity(self, db: Session, payload: ProviderActivityRecord) -> ProviderRetentionResponse:
        now = payload.activity_timestamp or datetime.now(timezone.utc)
        record = self.repo.get_by_provider_id(db, payload.provider_id)

        if not record:
            record = MarketProviderRetention(
                provider_id=payload.provider_id,
                is_active=True,
                onboarded_at=now,
                last_active_at=now,
                continuation_status="CONTINUOUS",
                supply_density_region=payload.region or "BASTAR",
                metadata_json=payload.metadata or {},
            )
            record = self.repo.create(db, record)

        # Check for reactivation (e.g. inactive > 30 days returning)
        last_act = record.last_active_at
        if last_act.tzinfo is None:
            last_act = last_act.replace(tzinfo=timezone.utc)
        if (now - last_act).total_seconds() > 30 * 86400:
            record.reactivated_count += 1
            record.continuation_status = "REACTIVATED"

        record.last_active_at = now
        record.is_active = True
        if payload.region:
            record.supply_density_region = payload.region

        act = payload.activity_type.upper()
        if act == "LISTING_UPDATE":
            record.listing_update_count += 1
            record.last_listing_update_at = now
        elif act == "LEAD_RESPONSE":
            record.total_leads_responded += 1
            record.last_lead_responded_at = now
        elif act == "BOOKING_MANAGEMENT":
            record.total_bookings_managed += 1

        saved = self.repo.update(db, record)
        return self._to_response(saved)

    def record_lead_received(self, db: Session, provider_id: str) -> ProviderRetentionResponse:
        record = self.repo.get_by_provider_id(db, provider_id)
        now = datetime.now(timezone.utc)
        if not record:
            record = MarketProviderRetention(
                provider_id=provider_id,
                is_active=True,
                onboarded_at=now,
                last_active_at=now,
                total_leads_received=1,
                last_lead_at=now,
            )
            saved = self.repo.create(db, record)
            return self._to_response(saved)

        record.total_leads_received += 1
        record.last_lead_at = now
        saved = self.repo.update(db, record)
        return self._to_response(saved)

    def get_overview(self, db: Session) -> ProviderRetentionOverview:
        total, items = self.repo.list(db, limit=10000)
        active = sum(1 for p in items if p.is_active)
        reactivated = sum(p.reactivated_count for p in items)
        tot_updates = sum(p.listing_update_count for p in items)
        status_dist: dict[str, int] = {}
        for p in items:
            status_dist[p.continuation_status] = status_dist.get(p.continuation_status, 0) + 1

        cont_rate = round(active / max(1, total), 4) if total > 0 else 0.0
        avg_updates = round(tot_updates / max(1, total), 1) if total > 0 else 0.0

        return ProviderRetentionOverview(
            total_providers_onboarded=total,
            active_providers_count=active,
            continuation_rate=cont_rate,
            reactivated_providers_count=reactivated,
            average_listing_updates_per_provider=avg_updates,
            status_distribution=status_dist,
        )

    def get_supply_density(self, db: Session, region: str = "BASTAR") -> ProviderSupplyDensityMetrics:
        total, items = self.repo.list(db, region=region, limit=1000)
        active = sum(1 for p in items if p.is_active)
        return ProviderSupplyDensityMetrics(
            region=region,
            verified_providers=total,
            active_providers=active,
            average_lead_capacity=active * 8,
            experience_diversity_count=max(3, len(items) // 2),
        )

    def _to_response(self, p: MarketProviderRetention) -> ProviderRetentionResponse:
        resp_rate = round(p.total_leads_responded / max(1, p.total_leads_received), 4) if p.total_leads_received > 0 else 1.0
        return ProviderRetentionResponse(
            id=p.id,
            provider_id=p.provider_id,
            is_active=p.is_active,
            onboarded_at=p.onboarded_at,
            last_active_at=p.last_active_at,
            last_lead_at=p.last_lead_at,
            last_lead_responded_at=p.last_lead_responded_at,
            last_listing_update_at=p.last_listing_update_at,
            total_leads_received=p.total_leads_received,
            total_leads_responded=p.total_leads_responded,
            total_bookings_managed=p.total_bookings_managed,
            listing_update_count=p.listing_update_count,
            reactivated_count=p.reactivated_count,
            continuation_status=p.continuation_status,
            supply_density_region=p.supply_density_region,
            lead_response_rate=resp_rate,
            created_at=p.created_at,
            updated_at=p.updated_at,
        )
