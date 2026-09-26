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
from app.modules.market_validation.content.models import MarketContentEntry
from app.modules.market_validation.content_evidence.models import MarketContentEvidence
from app.modules.market_validation.trust.models import MarketContentTrust
from app.modules.market_validation.content_experiments.models import (
    MarketContentExperiment,
    MarketContentAssignment,
)
from app.modules.market_validation.discovery.models import MarketDiscoveryEvent
from app.modules.market_validation.content_analysis.models import MarketContentPerformance

MV5_TABLES = [
    MarketContentPerformance.__table__,
    MarketDiscoveryEvent.__table__,
    MarketContentAssignment.__table__,
    MarketContentExperiment.__table__,
    MarketContentTrust.__table__,
    MarketContentEvidence.__table__,
    MarketContentEntry.__table__,
]


@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    for tbl in reversed(MV5_TABLES):
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
        for tbl in MV5_TABLES:
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


@pytest.fixture(scope="function")
def researcher_headers():
    return {
        "X-User-Role": "MARKET_RESEARCHER",
        "X-User-ID": "00000000-0000-0000-0000-000000000099",
    }


@pytest.fixture(scope="function")
def admin_headers():
    return {
        "X-User-Role": "ADMIN",
        "X-User-ID": "00000000-0000-0000-0000-000000000098",
    }
