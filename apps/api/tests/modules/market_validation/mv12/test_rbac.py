import pytest
from app.modules.market_validation.auth import (
    VALIDATION_ROLES,
    PILOT_CONTROL_ROLES,
    PILOT_APPROVER_ROLES,
)


def test_rbac_role_hierarchies():
    # Ordinary researcher cannot approve pilot or scale decisions (Section 47 & 48)
    assert "MARKET_RESEARCHER" in VALIDATION_ROLES
    assert "MARKET_RESEARCHER" not in PILOT_CONTROL_ROLES
    assert "MARKET_RESEARCHER" not in PILOT_APPROVER_ROLES

    # Pilot operator has operational control but cannot approve pilot promotion
    assert "PILOT_OPERATOR" in PILOT_CONTROL_ROLES
    assert "PILOT_OPERATOR" not in PILOT_APPROVER_ROLES

    # Admin and Scale Admin have approval authority
    assert "SCALE_ADMIN" in PILOT_APPROVER_ROLES
    assert "ADMIN" in PILOT_APPROVER_ROLES
