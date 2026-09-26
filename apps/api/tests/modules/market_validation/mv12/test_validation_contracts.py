import pytest
from pydantic import ValidationError
from app.modules.market_validation.pilot.schemas import PilotCreate, PilotScope, VALID_PILOT_STATUSES
from app.modules.market_validation.market_selection.schemas import MarketCandidateCreate
from app.modules.market_validation.scale_gates.schemas import ScaleGateCreate


def test_pilot_schema_valid_contract():
    pilot = PilotCreate(
        name="Bastar Ecotourism Pilot",
        validation_decision_id="MV10-GO-001",
        minimum_sample=50,
        target_sample=200,
    )
    assert pilot.name == "Bastar Ecotourism Pilot"
    assert pilot.minimum_sample == 50
    assert pilot.target_sample == 200
    assert "destination_discovery" in pilot.product_scope.in_scope
    assert "statewide_unrestricted_marketplace" in pilot.product_scope.out_of_scope


def test_pilot_schema_sample_bounds_validation():
    with pytest.raises(ValidationError):
        # minimum sample must be >= 10
        PilotCreate(
            validation_decision_id="MV10-GO-001",
            minimum_sample=2,
        )


def test_market_candidate_score_bounds_validation():
    # 0 to 100 valid score bounds
    candidate = MarketCandidateCreate(
        geography_id="Bastar",
        demand_score=85.0,
        risk_score=20.0,
    )
    assert candidate.demand_score == 85.0

    with pytest.raises(ValidationError):
        # negative score rejected
        MarketCandidateCreate(geography_id="Bastar", demand_score=-5.0)

    with pytest.raises(ValidationError):
        # > 100 score rejected
        MarketCandidateCreate(geography_id="Bastar", demand_score=105.0)


def test_scale_gate_schema_contract():
    gate = ScaleGateCreate(
        pilot_id="pilot-test-001",
        gate_name="gate_1_consumer_demand",
        requirement="Discovery to planning conversion >= 20%",
        metric="discovery_to_plan_rate",
        threshold=0.20,
    )
    assert gate.gate_name == "gate_1_consumer_demand"
    assert gate.threshold == 0.20
    assert gate.status == "PENDING"
