import sqlite3
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sqlite3.register_adapter(uuid.UUID, lambda u: str(u))

from app.core.database import get_db
from app.main import app

from app.modules.market_validation.pilot.models import ValidationPilot, PilotCohort, PilotAuditEvent
from app.modules.market_validation.market_selection.models import MarketCandidate
from app.modules.market_validation.launch_readiness.models import LaunchReadinessAssessment
from app.modules.market_validation.launch_controls.models import LaunchControl
from app.modules.market_validation.operational_readiness.models import OperationalReadiness
from app.modules.market_validation.scale_gates.models import ScaleGate
from app.modules.market_validation.expansion.models import ExpansionCandidate

MV11_TABLES = [
    PilotAuditEvent.__table__,
    PilotCohort.__table__,
    ExpansionCandidate.__table__,
    ScaleGate.__table__,
    OperationalReadiness.__table__,
    LaunchControl.__table__,
    LaunchReadinessAssessment.__table__,
    MarketCandidate.__table__,
    ValidationPilot.__table__,
]


@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    for tbl in reversed(MV11_TABLES):
        tbl.create(bind=engine, checkfirst=True)

    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        for tbl in MV11_TABLES:
            tbl.drop(bind=engine, checkfirst=True)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def operator_headers():
    return {
        "X-User-Role": "PILOT_OPERATOR",
        "X-User-ID": str(uuid.uuid4()),
    }


@pytest.fixture
def approver_headers():
    return {
        "X-User-Role": "SCALE_ADMIN",
        "X-User-ID": str(uuid.uuid4()),
    }


@pytest.fixture
def unauthorized_headers():
    return {
        "X-User-Role": "ANONYMOUS_USER",
        "X-User-ID": str(uuid.uuid4()),
    }
