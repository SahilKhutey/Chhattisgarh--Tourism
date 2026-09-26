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
from app.modules.market_validation.final.models import (
    MarketValidationEvidenceSnapshot,
    MarketValidationDecision,
    MarketValidationRisk,
)

MV13_TABLES = [
    MarketValidationRisk.__table__,
    MarketValidationDecision.__table__,
    MarketValidationEvidenceSnapshot.__table__,
]


@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    for tbl in reversed(MV13_TABLES):
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
        for tbl in MV13_TABLES:
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
def approver_headers():
    return {
        "X-User-Role": "SCALE_ADMIN",
        "X-User-ID": str(uuid.uuid4()),
    }
