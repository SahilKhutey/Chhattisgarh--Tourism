import uuid
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.modules.content_entries.models import ContentEntry
from app.modules.content_template.models import (
    ContentTemplate,
    TemplateField,
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
