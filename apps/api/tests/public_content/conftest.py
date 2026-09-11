from __future__ import annotations

import uuid
from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import get_db
from app.main import app
from app.modules.admin.dependencies import AdminUser, get_current_user
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_template.models.template import ContentTemplate
from app.modules.content_template.models.template_field import TemplateField
from app.modules.content_template.models.template_version import (
    TemplateVersion,
    TemplateVersionField,
)
from app.modules.localization.models import Locale
from app.modules.localization.content_models import (
    ContentLocalization,
    TemplateLocalization,
)
from app.modules.glossary.models import GlossaryTerm, GlossaryTermLocale
from app.modules.accessibility.models import (
    AccessibilityAudit,
    AccessibilityIssue,
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
    Locale.__table__.create(bind=engine)
    GlossaryTerm.__table__.create(bind=engine)
    GlossaryTermLocale.__table__.create(bind=engine)
    TemplateLocalization.__table__.create(bind=engine)
    ContentLocalization.__table__.create(bind=engine)
    AccessibilityAudit.__table__.create(bind=engine)
    AccessibilityIssue.__table__.create(bind=engine)

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
        AccessibilityIssue.__table__.drop(bind=engine)
        AccessibilityAudit.__table__.drop(bind=engine)
        ContentLocalization.__table__.drop(bind=engine)
        TemplateLocalization.__table__.drop(bind=engine)
        GlossaryTermLocale.__table__.drop(bind=engine)
        GlossaryTerm.__table__.drop(bind=engine)
        Locale.__table__.drop(bind=engine)
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

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def destination_template(db_session):
    t_id = uuid.uuid4()
    template = ContentTemplate(
        id=t_id,
        name="Destination Template",
        slug="destination",
        status="PUBLISHED",
    )
    db_session.add(template)

    v_id = uuid.uuid4()
    version = TemplateVersion(
        id=v_id,
        template_id=t_id,
        version_number=1,
        name="Destination v1",
        slug="destination-v1",
        schema_hash="hash123",
        created_by="admin",
    )
    db_session.add(version)

    fields_data = [
        ("name", "Destination Name", "TEXT", 1, True, True, "Basic Info"),
        ("description", "Description", "RICHTEXT", 2, True, True, "Basic Info"),
        ("hero_image", "Hero Image", "IMAGE", 3, False, False, "Media"),
        ("gallery", "Gallery", "GALLERY", 4, False, False, "Media"),
        ("location", "Location", "GEO_POINT", 5, False, False, "Location"),
        ("rating", "Rating", "NUMBER", 6, False, False, "Details"),
        ("is_featured", "Is Featured", "BOOLEAN", 7, False, False, "Details"),
        ("tags", "Tags", "TAGS", 8, False, False, "Details"),
        ("nearby_destinations", "Nearby Destinations", "RELATION", 9, False, False, "Relations"),
    ]

    for key, label, f_type, order, req, trans, grp in fields_data:
        f = TemplateVersionField(
            id=uuid.uuid4(),
            version_id=v_id,
            key=key,
            label=label,
            type=f_type,
            order=order,
            required=req,
            translatable=trans,
            group=grp,
            config={},
        )
        db_session.add(f)

    template.published_version_id = v_id
    db_session.commit()
    db_session.refresh(template)
    db_session.refresh(version)
    return template, version


@pytest.fixture(scope="function")
def unpublished_related_entry(db_session, destination_template):
    template, version = destination_template
    entry = ContentEntry(
        id=uuid.uuid4(),
        template_id=template.id,
        template_version_id=version.id,
        slug="secret-caves",
        title="Secret Caves",
        status="DRAFT",  # UNPUBLISHED
        values={
            "name": "Secret Caves",
            "description": "<p>Unpublished hidden caves.</p>",
        },
        revision=1,
        created_by="admin",
        updated_by="admin",
    )
    db_session.add(entry)
    db_session.commit()
    db_session.refresh(entry)
    return entry


@pytest.fixture(scope="function")
def published_entry(db_session, destination_template, unpublished_related_entry):
    template, version = destination_template
    entry = ContentEntry(
        id=uuid.uuid4(),
        template_id=template.id,
        template_version_id=version.id,
        slug="barnawapara",
        title="Barnawapara Sanctuary",
        status="PUBLISHED",
        values={
            "name": "Barnawapara Sanctuary",
            "description": "<p>A lush wildlife sanctuary in Chhattisgarh.</p>",
            "hero_image": {
                "url": "https://images.example.com/barna.jpg",
                "alt_text": "Lush forest trees of Barnawapara",
            },
            "gallery": [
                {
                    "url": "https://images.example.com/barna1.jpg",
                    "alt_text": "Deer in Barnawapara",
                }
            ],
            "location": {"latitude": 21.4, "longitude": 82.4},
            "rating": 4.8,
            "is_featured": True,
            "tags": ["wildlife", "nature", "safari"],
            "nearby_destinations": [str(unpublished_related_entry.id)],
        },
        locale_values={
            "hi": {
                "name": "बारनवापारा वन्यजीव अभयारण्य",
                "description": "<p>छत्तीसगढ़ का एक प्रसिद्ध वन्यजीव अभयारण्य।</p>",
            }
        },
        revision=1,
        created_by="admin",
        updated_by="admin",
        published_at=datetime.now(timezone.utc),
    )
    db_session.add(entry)
    db_session.commit()
    db_session.refresh(entry)
    return entry


@pytest.fixture(scope="function")
def draft_entry(db_session, destination_template):
    template, version = destination_template
    entry = ContentEntry(
        id=uuid.uuid4(),
        template_id=template.id,
        template_version_id=version.id,
        slug="draft-destination",
        title="Draft Destination",
        status="DRAFT",
        values={
            "name": "Draft Destination",
            "description": "<p>Work in progress.</p>",
        },
        revision=1,
        created_by="creator",
        updated_by="creator",
    )
    db_session.add(entry)
    db_session.commit()
    db_session.refresh(entry)
    return entry
