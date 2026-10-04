from __future__ import annotations

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.events.models import OutboxEvent
from app.modules.social.models.creator import Creator
from app.modules.social.models.moderation import SocialModerationLog
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.models.social_media import SocialMedia
from app.modules.social.models.sync_log import SocialSyncRun
from app.modules.social.models.sync_state import SocialAccountSyncState


@pytest.fixture
def session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    OutboxEvent.__table__.create(bind=engine, checkfirst=True)
    Creator.__table__.create(bind=engine, checkfirst=True)
    SocialAccount.__table__.create(bind=engine, checkfirst=True)
    SocialAccountSyncState.__table__.create(bind=engine, checkfirst=True)
    SocialContent.__table__.create(bind=engine, checkfirst=True)
    SocialMedia.__table__.create(bind=engine, checkfirst=True)
    SocialSyncRun.__table__.create(bind=engine, checkfirst=True)
    SocialModerationLog.__table__.create(bind=engine, checkfirst=True)

    session_factory = sessionmaker(bind=engine)
    sess = session_factory()
    try:
        yield sess
    finally:
        sess.close()
