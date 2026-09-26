import pytest
from app.modules.market_validation.expansion.schemas import ExpansionCandidateCreate
from app.modules.market_validation.expansion.service import ExpansionService


def test_expansion_candidate_transferability_score():
    service = ExpansionService(db=None)

    candidate = ExpansionCandidateCreate(
        current_market_id="Bastar",
        candidate_market_id="Surguja",
        similarity_score=80.0,
        demand_score=75.0,
        supply_score=70.0,
        geographic_fit=75.0,
        operational_fit=65.0,
        economic_fit=70.0,
        expansion_risk=20.0,
    )
    score = service.calculate_expansion_score(candidate)
    assert score > 60.0
    assert score <= 100.0


def test_expansion_candidate_high_risk_penalty():
    service = ExpansionService(db=None)

    risky_candidate = ExpansionCandidateCreate(
        current_market_id="Bastar",
        candidate_market_id="HighRiskZone",
        similarity_score=80.0,
        demand_score=90.0,
        supply_score=80.0,
        geographic_fit=80.0,
        operational_fit=70.0,
        economic_fit=75.0,
        expansion_risk=80.0,  # 80 * 0.15 = 12 pt deduction
    )
    score = service.calculate_expansion_score(risky_candidate)
    assert score < 75.0
