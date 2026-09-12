from __future__ import annotations

import uuid
from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.db.session import get_db as session_get_db
from app.main import app
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_template.models.template import ContentTemplate
from app.modules.content_template.models.template_field import TemplateField
from app.modules.content_template.models.template_version import (
    TemplateVersion,
    TemplateVersionField,
)
from app.modules.search.models import SearchDocument, SearchEvent, SearchSynonym, TaxonomyTerm
from app.modules.intelligence.embeddings.models import ContentEmbedding, EmbeddingModel
from app.modules.intelligence.knowledge_graph.models import EntityAlias, GraphEntity, GraphRelationship


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

    EmbeddingModel.__table__.create(bind=engine)
    ContentEmbedding.__table__.create(bind=engine)
    GraphEntity.__table__.create(bind=engine)
    GraphRelationship.__table__.create(bind=engine)
    EntityAlias.__table__.create(bind=engine)

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
    app.dependency_overrides[session_get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_data(db_session):
    # 1. Active embedding model
    model = EmbeddingModel(
        id=uuid.uuid4(),
        model_name="test-bge-m3",
        model_version="1.0",
        dimension=1024,
        provider="mock",
        is_active=True,
    )
    db_session.add(model)
    db_session.flush()

    # 2. Template and Version
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

    # 3. Published Entry: Chitrakote
    chitrakote = ContentEntry(
        id=uuid.uuid4(),
        template_id=template.id,
        template_version_id=version.id,
        slug="chitrakote-waterfall",
        title="Chitrakote Waterfall",
        status="PUBLISHED",
        created_by="test-user",
        updated_by="test-user",
        values={
            "title": "Chitrakote Waterfall",
            "name": "Chitrakote Waterfall",
            "content_type": "WATERFALL",
            "district": "Bastar",
            "category": "Nature",
            "categories": ["Nature", "Waterfalls"],
            "tags": ["waterfall", "scenic", "monsoon", "photography"],
            "activities": ["Sightseeing", "Photography", "Boating"],
            "description": "Widest waterfall in India, often called the Niagara of India.",
            "body": "Chitrakote Waterfall is situated in Bastar district on the Indravati River.",
        },
    )
    db_session.add(chitrakote)

    # 4. Published Entry: Tirathgarh
    tirathgarh = ContentEntry(
        id=uuid.uuid4(),
        template_id=template.id,
        template_version_id=version.id,
        slug="tirathgarh-waterfall",
        title="Tirathgarh Waterfall",
        status="PUBLISHED",
        created_by="test-user",
        updated_by="test-user",
        values={
            "title": "Tirathgarh Waterfall",
            "name": "Tirathgarh Waterfall",
            "content_type": "WATERFALL",
            "district": "Bastar",
            "category": "Nature",
            "categories": ["Nature", "Waterfalls"],
            "tags": ["waterfall", "nature", "forest"],
            "activities": ["Trekking", "Photography"],
            "description": "Tiered cascade located in Kanger Ghati National Park.",
            "body": "Tirathgarh falls are surrounded by lush green forests.",
        },
    )
    db_session.add(tirathgarh)

    # 5. Published Entry: Sirpur
    sirpur = ContentEntry(
        id=uuid.uuid4(),
        template_id=template.id,
        template_version_id=version.id,
        slug="sirpur-heritage-site",
        title="Sirpur Heritage Site",
        status="PUBLISHED",
        created_by="test-user",
        updated_by="test-user",
        values={
            "title": "Sirpur Heritage Site",
            "name": "Sirpur Heritage Site",
            "content_type": "HERITAGE_SITE",
            "district": "Mahasamund",
            "category": "Heritage",
            "categories": ["Heritage", "Monuments"],
            "tags": ["heritage", "archaeology", "temple", "ancient"],
            "activities": ["Heritage Walk", "Photography"],
            "description": "Ancient archaeological complex featuring the Laxman Temple.",
            "body": "Sirpur is a historical town on the banks of Mahanadi.",
        },
    )
    db_session.add(sirpur)

    # 6. Draft Entry (should never be embedded or recommended)
    draft_entry = ContentEntry(
        id=uuid.uuid4(),
        template_id=template.id,
        template_version_id=version.id,
        slug="secret-cave",
        title="Secret Unreleased Cave",
        status="DRAFT",
        created_by="test-user",
        updated_by="test-user",
        values={
            "title": "Secret Unreleased Cave",
            "district": "Bastar",
            "category": "Adventure",
        },
    )
    db_session.add(draft_entry)
    db_session.flush()

    # Add SearchDocuments for published entries so hybrid search has search documents
    doc1 = SearchDocument(
        id=uuid.uuid4(),
        content_entry_id=chitrakote.id,
        template_id=template.id,
        template_version_id=version.id,
        slug=chitrakote.slug,
        title="Chitrakote Waterfall",
        content_type="WATERFALL",
        district="Bastar",
        categories=["Nature", "Waterfalls"],
        tags=["waterfall", "scenic"],
        description="Widest waterfall in India",
        searchable_text="Chitrakote Waterfall Bastar nature",
        locale="en",
        is_published=True,
        quality_score=0.95,
        popularity_score=100.0,
    )
    doc2 = SearchDocument(
        id=uuid.uuid4(),
        content_entry_id=tirathgarh.id,
        template_id=template.id,
        template_version_id=version.id,
        slug=tirathgarh.slug,
        title="Tirathgarh Waterfall",
        content_type="WATERFALL",
        district="Bastar",
        categories=["Nature", "Waterfalls"],
        tags=["waterfall", "nature"],
        description="Tiered cascade in Kanger Valley",
        searchable_text="Tirathgarh Waterfall Bastar nature",
        locale="en",
        is_published=True,
        quality_score=0.90,
        popularity_score=80.0,
    )
    doc3 = SearchDocument(
        id=uuid.uuid4(),
        content_entry_id=sirpur.id,
        template_id=template.id,
        template_version_id=version.id,
        slug=sirpur.slug,
        title="Sirpur Heritage Site",
        content_type="HERITAGE_SITE",
        district="Mahasamund",
        categories=["Heritage"],
        tags=["heritage", "temple"],
        description="Ancient archaeological complex",
        searchable_text="Sirpur Heritage Site Mahasamund temple",
        locale="en",
        is_published=True,
        quality_score=0.88,
        popularity_score=60.0,
    )
    db_session.add_all([doc1, doc2, doc3])
    db_session.commit()

    return {
        "model": model,
        "template": template,
        "version": version,
        "chitrakote": chitrakote,
        "tirathgarh": tirathgarh,
        "sirpur": sirpur,
        "draft": draft_entry,
    }
