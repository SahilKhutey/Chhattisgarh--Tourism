from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.modules.market_validation.provider_metrics.models import MarketProviderMetric
from app.modules.market_validation.providers.models import MarketProvider
from app.modules.market_validation.onboarding.models import MarketProviderOnboarding
from app.modules.market_validation.listings.models import MarketProviderListingExperiment
from app.modules.market_validation.leads.models import MarketLead


class ProviderMetricRepository:
    def create(self, db: Session, metric: MarketProviderMetric) -> MarketProviderMetric:
        db.add(metric)
        db.commit()
        db.refresh(metric)
        return metric

    def get_by_provider_id(self, db: Session, provider_id: UUID) -> MarketProviderMetric | None:
        stmt = select(MarketProviderMetric).where(MarketProviderMetric.provider_id == provider_id)
        return db.execute(stmt).scalar_one_or_none()

    def update(self, db: Session, metric: MarketProviderMetric) -> MarketProviderMetric:
        db.commit()
        db.refresh(metric)
        return metric

    def get_funnel_stats(self, db: Session) -> dict:
        total_providers = db.execute(select(func.count(MarketProvider.id))).scalar_one() or 0
        onboarded_providers = db.execute(
            select(func.count(MarketProviderOnboarding.id)).where(MarketProviderOnboarding.status == "COMPLETED")
        ).scalar_one() or 0
        published_listings = db.execute(
            select(func.count(MarketProviderListingExperiment.id)).where(MarketProviderListingExperiment.status == "PUBLISHED")
        ).scalar_one() or 0
        total_leads = db.execute(select(func.count(MarketLead.id))).scalar_one() or 0
        qualified_leads = db.execute(
            select(func.count(MarketLead.id)).where(MarketLead.qualified.is_(True))
        ).scalar_one() or 0
        bookings = db.execute(
            select(func.count(MarketLead.id)).where(MarketLead.status.in_(["BOOKED", "COMPLETED"]))
        ).scalar_one() or 0

        onboarding_rate = round(onboarded_providers / total_providers, 4) if total_providers > 0 else 0.0
        lead_qual_rate = round(qualified_leads / total_leads, 4) if total_leads > 0 else 0.0
        booking_rate = round(bookings / qualified_leads, 4) if qualified_leads > 0 else 0.0

        return {
            "total_providers": total_providers,
            "onboarded_providers": onboarded_providers,
            "published_listings": published_listings,
            "total_leads": total_leads,
            "qualified_leads": qualified_leads,
            "bookings": bookings,
            "onboarding_completion_rate": onboarding_rate,
            "lead_qualification_rate": lead_qual_rate,
            "booking_conversion_rate": booking_rate,
        }

    def get_value_stats(self, db: Session) -> dict:
        stmt = select(
            func.sum(MarketProviderMetric.estimated_revenue),
            func.sum(MarketProviderMetric.bookings),
            func.sum(MarketProviderMetric.completed_services),
        )
        row = db.execute(stmt).first()
        total_rev = float(row[0] or 0.0) if row else 0.0
        total_bookings = int(row[1] or 0) if row else 0
        total_completed = int(row[2] or 0) if row else 0

        total_providers = db.execute(select(func.count(MarketProvider.id))).scalar_one() or 0
        willing_providers = db.execute(
            select(func.count(MarketProvider.id)).where(
                MarketProvider.willingness_to_pay.in_(["YES", "COMMISSION", "SUBSCRIPTION", "HIGH", "MODERATE"])
            )
        ).scalar_one() or 0

        willing_pct = round((willing_providers / total_providers) * 100.0, 2) if total_providers > 0 else 0.0

        return {
            "total_estimated_revenue": total_rev,
            "total_bookings": total_bookings,
            "total_completed_services": total_completed,
            "avg_perceived_value": "HIGH" if total_completed > 5 else "MODERATE",
            "providers_willing_to_pay_percentage": willing_pct,
        }

    def get_response_stats(self, db: Session) -> dict:
        leads = db.execute(select(MarketLead)).scalars().all()
        total_leads = len(leads)
        responded_leads = [l for l in leads if l.provider_response_at is not None and l.response_time_seconds is not None]

        response_rate = round(len(responded_leads) / total_leads, 4) if total_leads > 0 else 0.0
        avg_time = (
            sum(l.response_time_seconds for l in responded_leads) / len(responded_leads)
            if responded_leads
            else 0.0
        )

        buckets = {
            "under_1h": 0,
            "1h_to_4h": 0,
            "4h_to_24h": 0,
            "over_24h": 0,
            "no_response": total_leads - len(responded_leads),
        }
        for l in responded_leads:
            secs = l.response_time_seconds
            if secs < 3600:
                buckets["under_1h"] += 1
            elif secs <= 14400:
                buckets["1h_to_4h"] += 1
            elif secs <= 86400:
                buckets["4h_to_24h"] += 1
            else:
                buckets["over_24h"] += 1

        return {
            "avg_response_time_seconds": round(avg_time, 2),
            "response_rate": response_rate,
            "response_buckets": buckets,
        }
