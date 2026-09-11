import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.main import app
from app.modules.admin.dependencies import AdminUser, get_current_user
from app.modules.content_entries.models import ContentEntry
from app.modules.content_template.models import (
    ContentTemplate,
    TemplateField,
    TemplateVersion,
    TemplateVersionField,
)


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
        ContentEntry.__table__.drop(bind=engine)
        TemplateVersionField.__table__.drop(bind=engine)
        TemplateField.__table__.drop(bind=engine)
        ContentTemplate.__table__.drop(bind=engine)
        TemplateVersion.__table__.drop(bind=engine)


@pytest.fixture(scope="function")
def admin_user():
    return AdminUser(
        id=uuid.uuid4(),
        role="ADMIN",
        active=True,
    )


@pytest.fixture(scope="function")
def creator_user():
    return AdminUser(
        id=uuid.uuid4(),
        role="CREATOR",
        active=True,
    )


@pytest.fixture(scope="function")
def client(db_session, admin_user):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    def override_get_current_user():
        return admin_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def destination_template(db_session, admin_user):
    template_id = uuid.uuid4()
    version_id = uuid.uuid4()

    version = TemplateVersion(
        id=version_id,
        template_id=template_id,
        version_number=1,
        name="Tourist Destination",
        slug="destination",
        description="Destination template",
        schema_hash="hash-123456",
        breaking_change=False,
        created_by=str(admin_user.id),
    )
    db_session.add(version)
    db_session.flush()

    # Add fields to version
    fields = [
        TemplateVersionField(
            id=uuid.uuid4(),
            version_id=version_id,
            key="name",
            label="Destination Name",
            type="TEXT",
            required=True,
            translatable=True,
            order=1,
            group="General",
            config={"min_length": 2, "max_length": 100},
        ),
        TemplateVersionField(
            id=uuid.uuid4(),
            version_id=version_id,
            key="description",
            label="Description",
            type="TEXTAREA",
            required=False,
            translatable=True,
            order=2,
            group="General",
            config={"max_length": 1000},
        ),
        TemplateVersionField(
            id=uuid.uuid4(),
            version_id=version_id,
            key="entry_fee",
            label="Entry Fee",
            type="NUMBER",
            required=False,
            translatable=False,
            order=3,
            group="Details",
            config={"min": 0, "max": 10000},
        ),
        TemplateVersionField(
            id=uuid.uuid4(),
            version_id=version_id,
            key="is_active",
            label="Is Active",
            type="BOOLEAN",
            required=False,
            translatable=False,
            order=4,
            group="Details",
            config={},
        ),
        TemplateVersionField(
            id=uuid.uuid4(),
            version_id=version_id,
            key="category",
            label="Category",
            type="DROPDOWN",
            required=False,
            translatable=False,
            order=5,
            group="Details",
            config={
                "options": [
                    {"label": "Wildlife", "value": "wildlife"},
                    {"label": "Heritage", "value": "heritage"},
                    {"label": "Waterfalls", "value": "waterfalls"},
                ]
            },
        ),
        TemplateVersionField(
            id=uuid.uuid4(),
            version_id=version_id,
            key="tags",
            label="Tags",
            type="TAGS",
            required=False,
            translatable=False,
            order=6,
            group="Details",
            config={},
        ),
        TemplateVersionField(
            id=uuid.uuid4(),
            version_id=version_id,
            key="location",
            label="Coordinates",
            type="GEO_POINT",
            required=False,
            translatable=False,
            order=7,
            group="Geography",
            config={
                "bounds": {
                    "min_latitude": 17.0,
                    "max_latitude": 25.0,
                    "min_longitude": 79.0,
                    "max_longitude": 85.0,
                }
            },
        ),
        TemplateVersionField(
            id=uuid.uuid4(),
            version_id=version_id,
            key="cover_image",
            label="Cover Image",
            type="IMAGE",
            required=False,
            translatable=False,
            order=8,
            group="Media",
            config={},
        ),
        TemplateVersionField(
            id=uuid.uuid4(),
            version_id=version_id,
            key="nearby_destinations",
            label="Nearby Destinations",
            type="RELATION",
            required=False,
            translatable=False,
            order=9,
            group="Relations",
            config={"relation_template_slug": "destination"},
        ),
    ]
    for f in fields:
        db_session.add(f)

    template = ContentTemplate(
        id=template_id,
        name="Tourist Destination",
        slug="destination",
        description="Destination template",
        status="PUBLISHED",
        published_version_id=version_id,
        created_by=admin_user.id,
    )
    db_session.add(template)
    db_session.commit()
    db_session.refresh(template)
    db_session.refresh(version)

    return template, version
