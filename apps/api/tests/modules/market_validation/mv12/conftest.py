import pytest
from dataclasses import dataclass
from uuid import UUID

# Canonical deterministic test IDs (Section 5)
TEST_VALIDATION_ID = "mv-test-validation-001"
TEST_PILOT_ID = "pilot-test-001"
TEST_MARKET_ID = "market-test-001"
TEST_USER_ID = "user-test-001"
TEST_PROVIDER_ID = "provider-test-001"
TEST_CONSUMER_ID = "consumer-test-001"


@dataclass(frozen=True)
class MockUser:
    id: UUID
    role: str
    active: bool = True


@pytest.fixture
def fake_user():
    return MockUser(id=UUID("00000000-0000-0000-0000-000000000001"), role="ANONYMOUS_USER")


@pytest.fixture
def admin_user():
    return MockUser(id=UUID("00000000-0000-0000-0000-000000000002"), role="ADMIN")


@pytest.fixture
def researcher_user():
    return MockUser(id=UUID("00000000-0000-0000-0000-000000000003"), role="MARKET_RESEARCHER")


@pytest.fixture
def provider_user():
    return MockUser(id=UUID("00000000-0000-0000-0000-000000000004"), role="PROVIDER_OPERATOR")


@pytest.fixture
def consumer_user():
    return MockUser(id=UUID("00000000-0000-0000-0000-000000000005"), role="CONSUMER")


@pytest.fixture
def operator_user():
    return MockUser(id=UUID("00000000-0000-0000-0000-000000000006"), role="PILOT_OPERATOR")


@pytest.fixture
def scale_admin_user():
    return MockUser(id=UUID("00000000-0000-0000-0000-000000000007"), role="SCALE_ADMIN")
