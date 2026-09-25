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
from app.modules.market_validation.geographic.models import MarketGeoValidation
from app.modules.market_validation.geo_relationships.models import MarketGeoRelationship
from app.modules.market_validation.geo_experiments.models import MarketGeoExperiment, MarketGeoObservation
from app.modules.market_validation.route_validation.models import MarketRouteValidation
from app.modules.market_validation.geo_analysis.models import MarketGeoMetric

MV4_TABLES = [
    MarketGeoMetric.__table__,
    MarketGeoObservation.__table__,
    MarketRouteValidation.__table__,
    MarketGeoExperiment.__table__,
    MarketGeoRelationship.__table__,
    MarketGeoValidation.__table__,
]


@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    for tbl in reversed(MV4_TABLES):
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
        for tbl in MV4_TABLES:
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
