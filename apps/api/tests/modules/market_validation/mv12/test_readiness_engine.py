import pytest
from app.modules.market_validation.launch_readiness.schemas import LaunchReadinessCheck
from app.modules.market_validation.launch_readiness.service import LaunchReadinessService


def test_critical_safety_gate_failure_blocks_launch():
    # If safety is false, status must be BLOCKED even if all other gates pass (Section 22)
    check = LaunchReadinessCheck(
        product_ready=True,
        content_ready=True,
        geography_ready=True,
        supply_ready=True,
        consumer_ready=True,
        transaction_ready=True,
        analytics_ready=True,
        support_ready=True,
        security_ready=True,
        privacy_ready=True,
        safety_ready=False,  # CRITICAL FAIL
        operational_ready=True,
    )
    service = LaunchReadinessService(db=None)
    status, blockers = service.evaluate_readiness(check)
    assert status == "BLOCKED"
    assert any("Safety" in b for b in blockers)


def test_all_twelve_gates_ready():
    check = LaunchReadinessCheck(
        product_ready=True,
        content_ready=True,
        geography_ready=True,
        supply_ready=True,
        consumer_ready=True,
        transaction_ready=True,
        analytics_ready=True,
        support_ready=True,
        security_ready=True,
        privacy_ready=True,
        safety_ready=True,
        operational_ready=True,
    )
    service = LaunchReadinessService(db=None)
    status, blockers = service.evaluate_readiness(check)
    assert status == "READY"
    assert len(blockers) == 0
