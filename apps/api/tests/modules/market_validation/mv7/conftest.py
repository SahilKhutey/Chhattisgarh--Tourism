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
from app.modules.market_validation.providers.models import MarketProvider
from app.modules.market_validation.leads.models import MarketLead
from app.modules.market_validation.booking_intent.models import MarketBookingIntent
from app.modules.market_validation.provider_response.models import MarketProviderResponse
from app.modules.market_validation.conversion.models import MarketConversion
from app.modules.market_validation.attribution.models import MarketAttribution
from app.modules.market_validation.transactions.models import (
    MarketTransaction,
    MarketTransactionFeedback,
)

MV7_TABLES = [
    MarketTransactionFeedback.__table__,
    MarketTransaction.__table__,
    MarketAttribution.__table__,
    MarketConversion.__table__,
    MarketProviderResponse.__table__,
    MarketBookingIntent.__table__,
    MarketLead.__table__,
    MarketProvider.__table__,
]


@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    for tbl in reversed(MV7_TABLES):
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
        for tbl in MV7_TABLES:
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


@pytest.fixture
def test_provider(db_session):
    provider = MarketProvider(
        id=uuid.uuid4(),
        provider_type="LOCAL_GUIDE",
        segment="INDIVIDUAL",
        business_name="Bastar Tribal Trails",
        geography="BASTAR",
        operating_area="Jagdalpur & Chitrakote",
        verification_status="VERIFIED",
    )
    db_session.add(provider)
    db_session.commit()
    db_session.refresh(provider)
    return provider
