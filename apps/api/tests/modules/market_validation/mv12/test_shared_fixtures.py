from tests.modules.market_validation.mv12.conftest import (
    TEST_VALIDATION_ID,
    TEST_PILOT_ID,
    TEST_MARKET_ID,
    TEST_USER_ID,
)


def test_shared_fixtures_available(admin_user, researcher_user, operator_user, scale_admin_user):
    assert admin_user.role == "ADMIN"
    assert researcher_user.role == "MARKET_RESEARCHER"
    assert operator_user.role == "PILOT_OPERATOR"
    assert scale_admin_user.role == "SCALE_ADMIN"
    assert admin_user.active is True


def test_canonical_deterministic_ids_constant():
    assert TEST_VALIDATION_ID == "mv-test-validation-001"
    assert TEST_PILOT_ID == "pilot-test-001"
    assert TEST_MARKET_ID == "market-test-001"
    assert TEST_USER_ID == "user-test-001"
