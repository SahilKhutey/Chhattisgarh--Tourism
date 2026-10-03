from __future__ import annotations

import uuid
from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.events.models import OutboxEvent
from app.main import app
from app.modules.admin.dependencies import AdminUser, get_current_user
from app.modules.social.models import (
    Creator,
    CreatorFollow,
    SocialAccount,
    SocialAccountSyncState,
    SocialComment,
    SocialContent,
    SocialFeedTemplate,
    SocialLike,
    SocialMedia,
    SocialModerationLog,
    SocialSave,
    SocialShare,
    SocialSyncRun,
    SocialTripAdd,
)


@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Create tables
    OutboxEvent.__table__.create(bind=engine, checkfirst=True)
    Creator.__table__.create(bind=engine, checkfirst=True)
    SocialAccount.__table__.create(bind=engine, checkfirst=True)
    SocialAccountSyncState.__table__.create(bind=engine, checkfirst=True)
    SocialContent.__table__.create(bind=engine, checkfirst=True)
    SocialSyncRun.__table__.create(bind=engine, checkfirst=True)
    SocialFeedTemplate.__table__.create(bind=engine, checkfirst=True)
    SocialMedia.__table__.create(bind=engine, checkfirst=True)
    SocialLike.__table__.create(bind=engine, checkfirst=True)
    SocialSave.__table__.create(bind=engine, checkfirst=True)
    SocialComment.__table__.create(bind=engine, checkfirst=True)
    SocialShare.__table__.create(bind=engine, checkfirst=True)
    SocialTripAdd.__table__.create(bind=engine, checkfirst=True)
    CreatorFollow.__table__.create(bind=engine, checkfirst=True)
    SocialModerationLog.__table__.create(bind=engine, checkfirst=True)


    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        expire_on_commit=False,
        bind=engine,
    )
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    test_client = TestClient(app)
    try:
        yield test_client
    finally:
        app.dependency_overrides.clear()


@pytest.fixture
def test_user_id() -> uuid.UUID:
    return uuid.UUID("11111111-1111-1111-1111-111111111111")


@pytest.fixture
def admin_user_id() -> uuid.UUID:
    return uuid.UUID("22222222-2222-2222-2222-222222222222")


@pytest.fixture
def auth_headers(test_user_id) -> dict[str, str]:
    return {
        "X-User-ID": str(test_user_id),
        "X-User-Role": "CREATOR",
    }


@pytest.fixture
def admin_headers(admin_user_id) -> dict[str, str]:
    return {
        "X-User-ID": str(admin_user_id),
        "X-User-Role": "ADMIN",
    }
