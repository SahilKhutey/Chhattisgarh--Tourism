import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.modules.glossary.models import GlossaryTerm, GlossaryTermLocale
from app.modules.localization.models import Locale


@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Locale.__table__.create(bind=engine)
    GlossaryTerm.__table__.create(bind=engine)
    GlossaryTermLocale.__table__.create(bind=engine)

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
        GlossaryTermLocale.__table__.drop(bind=engine)
        GlossaryTerm.__table__.drop(bind=engine)
        Locale.__table__.drop(bind=engine)
