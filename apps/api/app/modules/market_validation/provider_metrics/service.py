from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status

from app.modules.market_validation.provider_metrics.models import MarketProviderMetric
from app.modules.market_validation.providers.models import MarketProvider
from app.modules.market_validation.leads.models import MarketLead
from app.modules.market_validation.provider_metrics.schemas import (
    ProviderMetricCreate,
    ProviderMetricUpdate,
    ProviderMetricResponse,
    ProviderFunnelAnalysis,
    ProviderValueAnalysis,
    ProviderResponseAnalysis,
)
from app.modules.market_validation.provider_metrics.repository import ProviderMetricRepository


class ProviderMetricService:
    def __init__(self, repo: ProviderMetricRepository | None = None):
        self.repo = repo or ProviderMetricRepository()

    def get_or_create_metric(self, db: Session, provider_id: uuid.UUID) -> MarketProviderMetric:
        provider = db.get(MarketProvider, provider_id)
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Provider {provider_id} not found.",
            )

        metric = self.repo.get_by_provider_id(db, provider_id)
        if not metric:
            metric = MarketProviderMetric(
                id=uuid.uuid4(),
                provider_id=provider_id,
                impressions=0,
                profile_views=0,
                contacts=0,
                qualified_leads=0,
                bookings=0,
                completed_services=0,
                estimated_revenue=0.0,
                time_saved=0,
                response_time_avg_seconds=0,
                perceived_value="MODERATE",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            metric = self.repo.create(db, metric)
        return metric

    def to_response(self, metric: MarketProviderMetric) -> ProviderMetricResponse:
        conv_rate = (
            round(metric.bookings / metric.qualified_leads, 4)
            if metric.qualified_leads > 0
            else 0.0
        )
        return ProviderMetricResponse(
            id=metric.id,
            provider_id=metric.provider_id,
            impressions=metric.impressions,
            profile_views=metric.profile_views,
            contacts=metric.contacts,
            qualified_leads=metric.qualified_leads,
            bookings=metric.bookings,
            completed_services=metric.completed_services,
            estimated_revenue=metric.estimated_revenue,
            time_saved=metric.time_saved,
            response_time_avg_seconds=metric.response_time_avg_seconds,
            perceived_value=metric.perceived_value,
            conversion_rate=conv_rate,
            created_at=metric.created_at,
            updated_at=metric.updated_at,
        )

    def update_metric(
        self,
        db: Session,
        provider_id: uuid.UUID,
        payload: ProviderMetricUpdate,
    ) -> MarketProviderMetric:
        metric = self.get_or_create_metric(db, provider_id)
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(metric, field, value)

        metric.updated_at = datetime.now(timezone.utc)
        return self.repo.update(db, metric)

    def recalculate_provider_metric(self, db: Session, provider_id: uuid.UUID) -> MarketProviderMetric:
        metric = self.get_or_create_metric(db, provider_id)
        leads = db.execute(
            select(MarketLead).where(MarketLead.provider_id == provider_id)
        ).scalars().all()

        metric.contacts = len(leads)
        metric.qualified_leads = sum(1 for l in leads if l.qualified)
        metric.bookings = sum(1 for l in leads if l.status in ["BOOKED", "COMPLETED"])
        metric.completed_services = sum(1 for l in leads if l.status == "COMPLETED")

        responded = [l for l in leads if l.response_time_seconds is not None]
        if responded:
            metric.response_time_avg_seconds = int(sum(l.response_time_seconds for l in responded) / len(responded))
        else:
            metric.response_time_avg_seconds = 0

        metric.updated_at = datetime.now(timezone.utc)
        return self.repo.update(db, metric)

    def get_funnel_analysis(self, db: Session) -> ProviderFunnelAnalysis:
        stats = self.repo.get_funnel_stats(db)
        return ProviderFunnelAnalysis(**stats)

    def get_value_analysis(self, db: Session) -> ProviderValueAnalysis:
        stats = self.repo.get_value_stats(db)
        return ProviderValueAnalysis(**stats)

    def get_response_analysis(self, db: Session) -> ProviderResponseAnalysis:
        stats = self.repo.get_response_stats(db)
        return ProviderResponseAnalysis(**stats)
