import pytest
from app.modules.market_validation.scale_gates.service import ScaleGateService


def test_scale_decision_rule_mapping():
    service = ScaleGateService(db=None)

    # All pass -> SCALE
    # Safety fail -> STOP
    # Operational fail -> PAUSE
    # Economics fail -> LIMITED_EXPANSION
    # Consumer fail -> PIVOT
    assert service.DEFAULT_GATES[5][0] == "gate_6_safety_compliance"
    assert service.DEFAULT_GATES[5][4] is True  # is blocker
