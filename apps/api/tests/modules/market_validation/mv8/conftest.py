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
from app.modules.market_validation.retention.models import MarketConsumerRetention
from app.modules.market_validation.cohorts.models import MarketRetentionCohort
from app.modules.market_validation.referrals.models import MarketReferral
from app.modules.market_validation.reviews.models import MarketReviewValidation
from app.modules.market_validation.provider_retention.models import MarketProviderRetention
from app.modules.market_validation.creator_retention.models import MarketCreatorRetention
from app.modules.market_validation.network.models import MarketNetworkInteraction, MarketNetworkGap

MV8_TABLES = [
    MarketNetworkGap.__table__,
    MarketNetworkInteraction.__table__,
    MarketCreatorRetention.__table__,
    MarketProviderRetention.__table__,
    MarketReviewValidation.__table__,
    MarketReferral.__table__,
    MarketRetentionCohort.__table__,
    MarketConsumerRetention.__table__,
]


@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    for tbl in reversed(MV8_TABLES):
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
        for tbl in MV8_TABLES:
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
def researcher_headers():
    return {
        "X-User-Role": "MARKET_RESEARCHER",
        "X-User-ID": str(uuid.uuid4()),
    }
