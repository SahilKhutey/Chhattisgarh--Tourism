from __future__ import annotations

import uuid
from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.main import app
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_template.models.template import ContentTemplate
from app.modules.content_template.models.template_field import TemplateField
from app.modules.content_template.models.template_version import (
    TemplateVersion,
    TemplateVersionField,
)
from app.modules.search.models import (
    SearchDocument,
    SearchEvent,
    SearchSynonym,
    TaxonomyTerm,
)


@pytest.fixture(autouse=True)
def mock_redis(monkeypatch):
    monkeypatch.setattr("app.core.redis.redis_client.get", lambda *a, **kw: None)
    monkeypatch.setattr("app.core.redis.redis_client.setex", lambda *a, **kw: None)
    monkeypatch.setattr("app.core.redis.redis_client.keys", lambda *a, **kw: [])
    monkeypatch.setattr("app.core.redis.redis_client.delete", lambda *a, **kw: 0)
    monkeypatch.setattr("app.core.redis.redis_client.ping", lambda *a, **kw: True)


@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TemplateVersion.__table__.create(bind=engine)
    ContentTemplate.__table__.create(bind=engine)
    TemplateField.__table__.create(bind=engine)
    TemplateVersionField.__table__.create(bind=engine)
    ContentEntry.__table__.create(bind=engine)
    SearchDocument.__table__.create(bind=engine)
    TaxonomyTerm.__table__.create(bind=engine)
    SearchSynonym.__table__.create(bind=engine)
    SearchEvent.__table__.create(bind=engine)

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
def sample_template(db_session):
    template = ContentTemplate(
        id=uuid.uuid4(),
        name="Destination Template",
        slug="destination",
        category="nature",
        status="PUBLISHED",
    )
    db_session.add(template)
    db_session.flush()

    version = TemplateVersion(
        id=uuid.uuid4(),
        template_id=template.id,
        version_number=1,
        name="Destination Template v1",
        slug="destination",
        category="nature",
        schema_hash="hash-1234",
        created_by="test-user",
    )
    db_session.add(version)
    db_session.flush()

    field_title = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=version.id,
        key="title",
        label="Title",
        type="text",
        required=True,
        translatable=True,
        order=1,
    )
    field_desc = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=version.id,
        key="description",
        label="Description",
        type="text",
        required=False,
        translatable=True,
        order=2,
    )
    field_district = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=version.id,
        key="district",
        label="District",
        type="text",
        required=False,
        translatable=True,
        order=3,
    )
    db_session.add_all([field_title, field_desc, field_district])
    db_session.flush()

    return template, version


@pytest.fixture
def published_entry(db_session, sample_template):
    template, version = sample_template
    entry = ContentEntry(
        id=uuid.uuid4(),
        template_id=template.id,
        template_version_id=version.id,
        slug="chitrakote-waterfall",
        title="Chitrakote Waterfall",
        status="PUBLISHED",
        values={
            "title": "Chitrakote Waterfall",
            "description": "The Niagara of India located in Bastar district.",
            "district": "Bastar",
            "category": "waterfall",
            "latitude": 19.202,
            "longitude": 81.701,
        },
        locale_values={
            "hi": {
                "title": "चित्रकूट जलप्रपात",
                "description": "बस्तर में स्थित भारत का नियाग्रा प्रपात।",
                "district": "बस्तर",
            }
        },
        created_by="test-user",
        updated_by="test-user",
        published_at=datetime.now(timezone.utc),
    )
    db_session.add(entry)
    db_session.flush()
    return entry


@pytest.fixture
def draft_entry(db_session, sample_template):
    template, version = sample_template
    entry = ContentEntry(
        id=uuid.uuid4(),
        template_id=template.id,
        template_version_id=version.id,
        slug="secret-hidden-cave",
        title="Secret Hidden Cave",
        status="DRAFT",
        values={
            "title": "Secret Hidden Cave",
            "description": "Unpublished cave.",
            "district": "Bastar",
        },
        created_by="test-user",
        updated_by="test-user",
    )
    db_session.add(entry)
    db_session.flush()
    return entry
