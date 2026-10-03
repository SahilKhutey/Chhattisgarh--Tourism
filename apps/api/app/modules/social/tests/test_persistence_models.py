from __future__ import annotations

import uuid
from datetime import datetime, timezone
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import Base
from app.events.models import OutboxEvent
from app.modules.social.domain.enums import (
    ContentType,
    ContentVisibility,
    SocialAccountStatus,
    SocialPlatform,
    SyncStatus,
)
from app.modules.social.domain.models import (
    SocialAccount as DomainSocialAccount,
    SocialContent as DomainSocialContent,
    SocialCreator as DomainSocialCreator,
    SocialSyncState as DomainSocialSyncState,
)
from app.modules.social.models.creator import Creator, SocialCreator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.models.sync_state import SocialAccountSyncState
from app.modules.social.services.social_account_service import SocialAccountService
from app.modules.social.schemas.account_schemas import (
    AdminCreatorRegister,
    SocialAccountAcceptPayload,
    SocialAccountCreate,
)


@pytest.fixture
def in_memory_session():
    engine = create_engine("sqlite:///:memory:")
    OutboxEvent.__table__.create(bind=engine, checkfirst=True)
    Creator.__table__.create(bind=engine, checkfirst=True)
    SocialAccount.__table__.create(bind=engine, checkfirst=True)
    SocialAccountSyncState.__table__.create(bind=engine, checkfirst=True)
    SocialContent.__table__.create(bind=engine, checkfirst=True)
    session_factory = sessionmaker(bind=engine)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()



def test_social_creator_alias_and_to_domain():
    assert SocialCreator is Creator
    creator = Creator(
        id=uuid.uuid4(),
        handle="bastar_artisan",
        display_name="Bastar Artisan",
        district_id="bastar",
        bio="Traditional crafts artisan",
        status="ACTIVE",
        is_verified=True,
    )
    domain_creator = creator.to_domain()
    assert isinstance(domain_creator, DomainSocialCreator)
    assert domain_creator.handle == "bastar_artisan"
    assert domain_creator.display_name == "Bastar Artisan"
    assert domain_creator.is_verified is True


def test_social_account_persistence_and_sync_state_relationship(in_memory_session: Session):
    creator = Creator(
        id=uuid.uuid4(),
        handle="kondagaon_crafts",
        display_name="Kondagaon Bell Metal",
        district_id="kondagaon",
    )
    in_memory_session.add(creator)
    in_memory_session.flush()

    account = SocialAccount(
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="@KondagaonCrafts",
        display_name="Kondagaon Crafts Official",
        external_account_id="UC_kondagaon_12345",
        status=SocialAccountStatus.ACTIVE.value,
        sync_status=SyncStatus.NEVER_RUN.value,
        is_sync_enabled=True,
    )
    in_memory_session.add(account)
    in_memory_session.flush()

    sync_state = SocialAccountSyncState(
        social_account_id=account.id,
        sync_status=SyncStatus.NEVER_RUN.value,
        sync_enabled=True,
    )
    in_memory_session.add(sync_state)
    in_memory_session.commit()

    # Query back and verify 1-to-1 relationship
    loaded = in_memory_session.query(SocialAccount).filter_by(id=account.id).one()
    assert loaded.display_name == "Kondagaon Crafts Official"
    assert loaded.external_account_id == "UC_kondagaon_12345"
    assert loaded.sync_enabled is True
    assert loaded.sync_state is not None
    assert loaded.sync_state.sync_status == SyncStatus.NEVER_RUN.value
    assert loaded.sync_state.social_account_id == account.id


def test_social_account_to_and_from_domain():
    now = datetime.now(timezone.utc)
    domain_acc = DomainSocialAccount(
        id=str(uuid.uuid4()),
        creator_id=str(uuid.uuid4()),
        platform=SocialPlatform.INSTAGRAM,
        handle="dantewada_trails",
        display_name="Dantewada Trails",
        external_account_id="ig_12345678",
        profile_url="https://instagram.com/dantewada_trails",
        status=SocialAccountStatus.ACTIVE,
        sync_status=SyncStatus.SUCCEEDED,
        sync_enabled=True,
        last_synced_at=now,
        last_successful_sync_at=now,
        metadata={"tags": ["nature", "temples"]},
    )

    orm_acc = SocialAccount.from_domain(domain_acc)
    assert str(orm_acc.id) == domain_acc.id
    assert orm_acc.handle == "dantewada_trails"
    assert orm_acc.display_name == "Dantewada Trails"
    assert orm_acc.external_account_id == "ig_12345678"
    assert orm_acc.sync_enabled is True
    assert orm_acc.metadata_json["tags"] == ["nature", "temples"]

    # Convert back to domain
    converted = orm_acc.to_domain()
    assert isinstance(converted, DomainSocialAccount)
    assert converted.id == domain_acc.id
    assert converted.platform == SocialPlatform.INSTAGRAM
    assert converted.status == SocialAccountStatus.ACTIVE
    assert converted.sync_status == SyncStatus.SUCCEEDED
    assert converted.metadata["tags"] == ["nature", "temples"]


def test_social_content_to_and_from_domain():
    now = datetime.now(timezone.utc)
    content_id = str(uuid.uuid4())
    creator_id = str(uuid.uuid4())
    acc_id = str(uuid.uuid4())

    domain_content = DomainSocialContent(
        id=content_id,
        creator_id=creator_id,
        social_account_id=acc_id,
        platform=SocialPlatform.YOUTUBE,
        provider_content_id="yt_vid_9999",
        content_type="video",
        title="Tirathgarh Falls Monsoon Wonder",
        description="Epic waterfalls in Bastar district",
        source_url="https://www.youtube.com/watch?v=yt_vid_9999",
        thumbnail_url="https://img.youtube.com/vi/yt_vid_9999/hqdefault.jpg",
        published_at=now,
        synced_at=now,
        status="PUBLISHED",
        visibility="PUBLIC",
        district_id="bastar",
        tourism_zone_id="south_cg",
        place_id=None,
        hashtags=["#tirathgarh", "#bastar"],
        tourism_tags=["waterfalls", "monsoon"],
        cultural_tags=["nature"],
        metadata={"source": "sync_worker"},
    )

    orm_content = SocialContent.from_domain(domain_content)
    assert str(orm_content.id) == content_id
    assert orm_content.provider == "youtube"
    assert orm_content.thumbnail_url == "https://img.youtube.com/vi/yt_vid_9999/hqdefault.jpg"
    assert orm_content.status == "PUBLISHED"
    assert orm_content.metadata_json["source"] == "sync_worker"

    converted = orm_content.to_domain()
    assert isinstance(converted, DomainSocialContent)
    assert converted.title == "Tirathgarh Falls Monsoon Wonder"
    assert converted.thumbnail_url == "https://img.youtube.com/vi/yt_vid_9999/hqdefault.jpg"
    assert converted.platform == SocialPlatform.YOUTUBE
    assert converted.metadata["source"] == "sync_worker"



def test_account_service_outbox_events_lifecycle(in_memory_session: Session):
    service = SocialAccountService(in_memory_session)

    # 1. Register creator with accounts
    creator_payload = AdminCreatorRegister(
        handle="chhattisgarh_lens",
        display_name="Chhattisgarh Lens",
        district_id="raipur",
        social_accounts=[
            SocialAccountCreate(
                platform=SocialPlatform.YOUTUBE,
                handle="@CGLens",
                profile_url="https://youtube.com/@CGLens",
            )
        ],
    )
    creator = service.register_creator_with_accounts(creator_payload)

    # Verify SOCIAL_ACCOUNT_REGISTERED outbox event was created
    reg_events = in_memory_session.query(OutboxEvent).filter(
        OutboxEvent.event_type == "SOCIAL_ACCOUNT_REGISTERED"
    ).all()
    assert len(reg_events) == 1
    assert reg_events[0].payload["handle"] == "@CGLens"

    account = in_memory_session.query(SocialAccount).filter_by(creator_id=creator.id).one()

    # Verify dedicated sync state was initialized
    assert account.sync_state is not None
    assert account.sync_state.sync_status == SyncStatus.NEVER_RUN.value

    # 2. Accept social account
    service.accept_social_account(
        account.id,
        SocialAccountAcceptPayload(approved_content_types=["VIDEO", "SHORT"], priority=95),
    )

    accept_events = in_memory_session.query(OutboxEvent).filter(
        OutboxEvent.event_type == "SOCIAL_ACCOUNT_ACCEPTED"
    ).all()
    assert len(accept_events) == 1
    assert accept_events[0].payload["account_id"] == str(account.id)

    # 3. Pause social account
    service.pause_social_account(account.id)
    pause_events = in_memory_session.query(OutboxEvent).filter(
        OutboxEvent.event_type == "SOCIAL_ACCOUNT_PAUSED"
    ).all()
    assert len(pause_events) == 1
    assert pause_events[0].payload["account_id"] == str(account.id)

    # 4. Activate social account
    service.activate_social_account(account.id)
    activate_events = in_memory_session.query(OutboxEvent).filter(
        OutboxEvent.event_type == "SOCIAL_ACCOUNT_ACTIVATED"
    ).all()
    assert len(activate_events) == 1
    assert activate_events[0].payload["account_id"] == str(account.id)
