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

from app.modules.market_validation.business_model.models import (
    MarketBusinessModel,
    MarketRevenueStream,
)
from app.modules.market_validation.monetization.models import (
    MarketMonetizationOffer,
    MarketMonetizationOrder,
    MarketMonetizationPolicy,
)
from app.modules.market_validation.pricing.models import MarketPricingExperiment
from app.modules.market_validation.experiments.models import MarketBusinessExperimentObservation
from app.modules.market_validation.willingness_to_pay.models import MarketWillingnessToPay
from app.modules.market_validation.unit_economics.models import MarketUnitEconomics

MV9_TABLES = [
    MarketMonetizationPolicy.__table__,
    MarketUnitEconomics.__table__,
    MarketWillingnessToPay.__table__,
    MarketBusinessExperimentObservation.__table__,
    MarketPricingExperiment.__table__,
    MarketMonetizationOrder.__table__,
    MarketMonetizationOffer.__table__,
    MarketRevenueStream.__table__,
    MarketBusinessModel.__table__,
]


@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    for tbl in reversed(MV9_TABLES):
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
        for tbl in MV9_TABLES:
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
def finance_admin_headers():
    return {
        "X-User-Role": "FINANCE_ADMIN",
        "X-User-ID": str(uuid.uuid4()),
    }
