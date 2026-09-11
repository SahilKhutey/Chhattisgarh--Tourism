import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.main import app
from app.modules.admin.dependencies import AdminUser, get_current_user
from app.modules.content_template.models import ContentTemplate, TemplateField


@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    ContentTemplate.__table__.create(bind=engine)
    TemplateField.__table__.create(bind=engine)

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
        TemplateField.__table__.drop(bind=engine)
        ContentTemplate.__table__.drop(bind=engine)


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

    def override_get_user():
        return admin_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_user

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def template(db_session):
    t = ContentTemplate(
        id=uuid.uuid4(),
        name="Test Destination",
        slug="test-destination",
        description="A draft destination template",
        category="destination",
        status="DRAFT",
    )
    db_session.add(t)
    db_session.commit()
    db_session.refresh(t)
    return t


@pytest.fixture(scope="function")
def published_template(db_session):
    t = ContentTemplate(
        id=uuid.uuid4(),
        name="Published Destination",
        slug="published-destination",
        description="A published destination template",
        category="destination",
        status="PUBLISHED",
    )
    db_session.add(t)
    db_session.flush()

    f = TemplateField(
        id=uuid.uuid4(),
        template_id=t.id,
        key="name",
        label="Name",
        field_type="TEXT",
        required=True,
        translatable=True,
        order=0,
        config={},
    )
    db_session.add(f)
    db_session.commit()
    db_session.refresh(t)
    return t
