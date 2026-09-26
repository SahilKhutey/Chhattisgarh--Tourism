from __future__ import annotations

from pydantic import BaseModel


class GuardrailStatus(BaseModel):
    guardrail: str
    is_compliant: bool
    details: str


class BusinessAnalysisReport(BaseModel):
    program: str = "CG Tourism OS — MV9 Business Model & Monetization Validation"
    primary_business_model: str
    monetization_strategy: str
    target_paying_segments: list[str]
    sustainable_economic_value_facilitated_inr: float
    platform_gross_revenue_inr: float
    platform_net_contribution_inr: float
    blended_contribution_margin_pct: float
    provider_ltv_cac_ratio: float
    provider_payback_months: float
    consumer_ltv_cac_ratio: float
    trust_risk_score: float
    monetization_readiness: str
    go_no_go_recommendation: str
    hypotheses_validated_count: int
    guardrails: list[GuardrailStatus]
    strategic_verdict: str
