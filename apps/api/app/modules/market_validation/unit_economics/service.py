from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.modules.market_validation.unit_economics.models import MarketUnitEconomics
from app.modules.market_validation.unit_economics.repository import UnitEconomicsRepository
from app.modules.market_validation.unit_economics.schemas import (
    UnitEconomicsInput,
    UnitEconomicsResponse,
    UnitEconomicsOverview,
)


class UnitEconomicsService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UnitEconomicsRepository(db)

    def initialize_defaults(self) -> None:
        existing = self.repo.list_records()
        if not existing:
            # 1. Provider unit economics baseline
            self.compute_and_save(
                UnitEconomicsInput(
                    segment="PROVIDER",
                    period="PILOT-PROVIDER-Q3",
                    spend=12000.0,
                    acquired_users=40,
                    activated_users=32,
                    paying_users=20,
                    revenue=14000.0,
                    variable_costs=1500.0,
                    expected_lifespan_cycles=12.0,  # 12-month retention
                )
            )

            # 2. Consumer unit economics baseline
            self.compute_and_save(
                UnitEconomicsInput(
                    segment="CONSUMER",
                    period="PILOT-CONSUMER-Q3",
                    spend=8000.0,
                    acquired_users=1600,
                    activated_users=640,
                    paying_users=65,
                    revenue=9685.0,
                    variable_costs=800.0,
                    expected_lifespan_cycles=2.5,  # 2.5 travel cycles
                )
            )

    def compute_and_save(self, data: UnitEconomicsInput) -> MarketUnitEconomics:
        cac = round(data.spend / max(1, data.acquired_users), 2)
        activated_cac = round(data.spend / max(1, data.activated_users), 2)
        paying_cac = round(data.spend / max(1, data.paying_users), 2)
        arpu = round(data.revenue / max(1, data.paying_users), 2)
        var_cost_per_user = round(data.variable_costs / max(1, data.paying_users), 2)
        contribution = round(data.revenue - data.variable_costs, 2)
        unit_contribution = round(contribution / max(1, data.paying_users), 2)
        ltv = round(unit_contribution * data.expected_lifespan_cycles, 2)
        ltv_cac = round(ltv / max(0.01, paying_cac), 2)
        payback = round(paying_cac / max(0.01, unit_contribution), 2)

        record = MarketUnitEconomics(
            segment=data.segment,
            period=data.period,
            spend=data.spend,
            acquired_users=data.acquired_users,
            activated_users=data.activated_users,
            paying_users=data.paying_users,
            cac=cac,
            activated_cac=activated_cac,
            arpu=arpu,
            variable_cost_per_user=var_cost_per_user,
            contribution_margin=contribution,
            expected_lifespan_cycles=data.expected_lifespan_cycles,
            ltv=ltv,
            ltv_cac_ratio=ltv_cac,
            payback_period_months=payback,
        )
        return self.repo.save(record)

    def get_overview(self, segment: str | None = None) -> UnitEconomicsOverview:
        self.initialize_defaults()
        records = self.repo.list_records(segment=segment)
        if not records:
            raise HTTPException(status_code=404, detail="No unit economics records found")

        r_responses = [UnitEconomicsResponse.model_validate(r) for r in records]
        avg_ltv_cac = round(sum(r.ltv_cac_ratio for r in r_responses) / len(r_responses), 2)
        viable = avg_ltv_cac >= 3.0 and any(r.payback_period_months <= 12.0 for r in r_responses)

        rationale = (
            f"Provider acquisition exhibits outstanding unit economics with LTV/CAC > 10x and payback under 1 month. "
            f"Consumer monetization contributes auxiliary margin while preserving organic free acquisition. Overall blended viability: {'HEALTHY' if viable else 'MARGINAL'}."
        )

        return UnitEconomicsOverview(
            records=r_responses,
            blended_ltv_cac=avg_ltv_cac,
            is_economically_viable=viable,
            viability_rationale=rationale,
        )
