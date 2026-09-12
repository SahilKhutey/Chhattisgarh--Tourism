import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.events.models import OutboxEvent
from app.main import app
from app.modules.admin.dependencies import AdminUser, get_current_user
from app.modules.content_entries.models import ContentEntry
from app.modules.content_template.models import (
    ContentTemplate,
    TemplateField,
    TemplateVersion,
    TemplateVersionField,
)
from app.modules.localization.models import Locale
from app.modules.localization.content_models import ContentLocalization, TemplateLocalization
from app.modules.glossary.models import GlossaryTerm, GlossaryTermLocale
from app.modules.accessibility.models import AccessibilityAudit, AccessibilityIssue
from app.modules.search.models import SearchDocument, TaxonomyTerm, SearchSynonym, SearchEvent
from app.modules.intelligence.knowledge_graph.models import GraphEntity, GraphRelationship, EntityAlias
from app.modules.intelligence.embeddings.models import EmbeddingModel, ContentEmbedding


@pytest.fixture(autouse=True)
def mock_redis(monkeypatch):
    monkeypatch.setattr("app.core.redis.redis_client.get", lambda *a, **kw: None)
    monkeypatch.setattr("app.core.redis.redis_client.set", lambda *a, **kw: True)
    monkeypatch.setattr("app.core.redis.redis_client.setex", lambda *a, **kw: True)
    monkeypatch.setattr("app.core.redis.redis_client.keys", lambda *a, **kw: [])
    monkeypatch.setattr("app.core.redis.redis_client.delete", lambda *a, **kw: 0)
    monkeypatch.setattr("app.core.redis.redis_client.ping", lambda *a, **kw: True)
    monkeypatch.setattr("app.core.redis.redis_client.publish", lambda *a, **kw: 1)


@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    # Create all required tables
    TemplateVersion.__table__.create(bind=engine, checkfirst=True)
    ContentTemplate.__table__.create(bind=engine, checkfirst=True)
    TemplateField.__table__.create(bind=engine, checkfirst=True)
    TemplateVersionField.__table__.create(bind=engine, checkfirst=True)
    ContentEntry.__table__.create(bind=engine, checkfirst=True)
    OutboxEvent.__table__.create(bind=engine, checkfirst=True)
    Locale.__table__.create(bind=engine, checkfirst=True)
    GlossaryTerm.__table__.create(bind=engine, checkfirst=True)
    GlossaryTermLocale.__table__.create(bind=engine, checkfirst=True)
    TemplateLocalization.__table__.create(bind=engine, checkfirst=True)
    ContentLocalization.__table__.create(bind=engine, checkfirst=True)
    AccessibilityAudit.__table__.create(bind=engine, checkfirst=True)
    AccessibilityIssue.__table__.create(bind=engine, checkfirst=True)
    SearchDocument.__table__.create(bind=engine, checkfirst=True)
    TaxonomyTerm.__table__.create(bind=engine, checkfirst=True)
    SearchSynonym.__table__.create(bind=engine, checkfirst=True)
    SearchEvent.__table__.create(bind=engine, checkfirst=True)
    GraphEntity.__table__.create(bind=engine, checkfirst=True)
    GraphRelationship.__table__.create(bind=engine, checkfirst=True)
    EntityAlias.__table__.create(bind=engine, checkfirst=True)
    EmbeddingModel.__table__.create(bind=engine, checkfirst=True)
    ContentEmbedding.__table__.create(bind=engine, checkfirst=True)

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


@pytest.fixture(scope="function")
def admin_client(db_session):
    def override_get_db():
        yield db_session

    uid = uuid.uuid4()
    app.dependency_overrides[get_db] = override_get_db

    client = TestClient(
        app,
        headers={"X-User-Role": "ADMIN", "X-User-ID": str(uid)},
    )
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def creator_client(db_session):
    def override_get_db():
        yield db_session

    uid = uuid.uuid4()
    app.dependency_overrides[get_db] = override_get_db

    client = TestClient(
        app,
        headers={"X-User-Role": "CREATOR", "X-User-ID": str(uid)},
    )
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def moderator_client(db_session):
    def override_get_db():
        yield db_session

    uid = uuid.uuid4()
    app.dependency_overrides[get_db] = override_get_db

    client = TestClient(
        app,
        headers={"X-User-Role": "MODERATOR", "X-User-ID": str(uid)},
    )
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def public_client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
