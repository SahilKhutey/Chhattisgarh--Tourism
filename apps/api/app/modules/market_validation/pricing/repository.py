from __future__ import annotations

from sqlalchemy.orm import Session
from app.modules.market_validation.pricing.models import MarketPricingExperiment
from app.modules.market_validation.pricing.schemas import PricingExperimentCreate


class PricingRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_experiment(self, data: PricingExperimentCreate) -> MarketPricingExperiment:
        exp = MarketPricingExperiment(
            revenue_stream_id=data.revenue_stream_id,
            customer_type=data.customer_type,
            experiment_type=data.experiment_type,
            control_price=data.control_price,
            variant_prices=data.variant_prices,
            eligibility_rule=data.eligibility_rule,
            primary_metric=data.primary_metric,
            secondary_metrics=data.secondary_metrics,
            status=data.status,
            decision="INCONCLUSIVE",
        )
        self.db.add(exp)
        self.db.commit()
        self.db.refresh(exp)
        return exp

    def get_experiment(self, experiment_id: str) -> MarketPricingExperiment | None:
        return self.db.query(MarketPricingExperiment).filter(MarketPricingExperiment.id == experiment_id).first()

    def list_experiments(
        self,
        customer_type: str | None = None,
        experiment_type: str | None = None,
        status: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[MarketPricingExperiment]:
        query = self.db.query(MarketPricingExperiment)
        if customer_type:
            query = query.filter(MarketPricingExperiment.customer_type == customer_type)
        if experiment_type:
            query = query.filter(MarketPricingExperiment.experiment_type == experiment_type)
        if status:
            query = query.filter(MarketPricingExperiment.status == status)
        return query.order_by(MarketPricingExperiment.created_at.desc()).offset(offset).limit(limit).all()

    def update_experiment_status(
        self,
        exp: MarketPricingExperiment,
        status: str,
        decision: str | None = None,
    ) -> MarketPricingExperiment:
        exp.status = status
        if decision:
            exp.decision = decision
        self.db.commit()
        self.db.refresh(exp)
        return exp
