from __future__ import annotations

import uuid
from datetime import datetime, timezone
import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.modules.social.acceptance.service import SocialAcceptanceService
from app.modules.social.acceptance.workflow import ConcurrencyStateConflictError
from app.modules.social.accounts.repository import SocialAccountRepository
from app.modules.social.content.repository import SocialContentRepository
from app.modules.social.context.repository import SocialContentContextRepository
from app.modules.social.creators.repository import CreatorRepository
from app.modules.social.domain.enums import (
    ContentStatus,
    ContentType,
    ContentVisibility,
    SocialAccountStatus,
    SocialContentStatus,
    SocialPlatform,
    SyncStatus,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.models.sync_state import SocialAccountSyncState
from app.modules.social.sync.repository import SocialSyncStateRepository
from app.modules.social.verification.repository import SocialVerificationRepository


def test_creator_persistence_and_slug(session: Session):
    creator_repo = CreatorRepository(session)
    creator = Creator(
        handle="bastar_wanderer",
        display_name="Bastar Wanderer",
        district_id="bastar",
        bio="Documenting unexplored trails of Bastar",
        metadata_json={"instagram_handle": "@bastar_wanderer", "niche": "nature"},
    )
    creator_repo.create(creator)
    session.commit()

    # Query via slug (synonym for handle)
    fetched = creator_repo.get_by_slug("bastar_wanderer")
    assert fetched is not None
    assert fetched.id == creator.id
    assert fetched.slug == "bastar_wanderer"
    assert fetched.handle == "bastar_wanderer"
    assert fetched.metadata_json.get("niche") == "nature"

    # Enforce unique slug/handle
    duplicate_creator = Creator(
        handle="bastar_wanderer",
        display_name="Duplicate Bastar",
        district_id="bastar",
    )
    session.add(duplicate_creator)
    with pytest.raises(IntegrityError):
        session.commit()
    session.rollback()


def test_account_partial_unique_index_on_external_identity(session: Session):
    creator_repo = CreatorRepository(session)
    creator = Creator(handle="cg_explorer", display_name="CG Explorer", district_id="raipur")
    creator_repo.create(creator)
    session.commit()

    acc_repo = SocialAccountRepository(session)

    # 1. Accounts without external_account_id can coexist
    acc1 = SocialAccount(
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="cg_exp_1",
        profile_url="https://youtube.com/@cg_exp_1",
        external_account_id=None,
    )
    acc2 = SocialAccount(
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="cg_exp_2",
        profile_url="https://youtube.com/@cg_exp_2",
        external_account_id=None,
    )
    acc_repo.create(acc1)
    acc_repo.create(acc2)
    session.commit()

    # 2. Set verified external_account_id on acc1
    acc1.external_account_id = "UC_CANONICAL_CHANNEL_100"
    session.commit()

    # Query by external identity
    found = acc_repo.get_by_external_identity(SocialPlatform.YOUTUBE.value, "UC_CANONICAL_CHANNEL_100")
    assert found is not None
    assert found.id == acc1.id

    # 3. Setting same external_account_id on another account on same platform raises IntegrityError
    acc3 = SocialAccount(
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="cg_exp_3",
        profile_url="https://youtube.com/@cg_exp_3",
        external_account_id="UC_CANONICAL_CHANNEL_100",
    )
    session.add(acc3)
    with pytest.raises(IntegrityError):
        session.commit()
    session.rollback()


def test_verification_history_retention(session: Session):
    creator_repo = CreatorRepository(session)
    creator = Creator(handle="surguja_tales", display_name="Surguja Tales", district_id="surguja")
    creator_repo.create(creator)
    session.commit()

    acc_repo = SocialAccountRepository(session)
    account = SocialAccount(
        creator_id=creator.id,
        platform=SocialPlatform.INSTAGRAM.value,
        handle="surguja_tales",
        profile_url="https://instagram.com/surguja_tales",
    )
    acc_repo.create(account)
    session.commit()

    v_repo = SocialVerificationRepository(session)

    # First attempt: failed
    v1 = v_repo.record_verification(
        social_account_id=account.id,
        status="failed",
        provider_handle="surguja_tales",
        verified_at=datetime(2026, 10, 1, 10, 0, 0, tzinfo=timezone.utc),
        details={"reason": "Profile not reachable"},
    )
    session.commit()

    # Second attempt: verified
    v2 = v_repo.record_verification(
        social_account_id=account.id,
        status="verified",
        provider_account_id="ig_12345678",
        provider_handle="surguja_tales",
        provider_display_name="Surguja Tales Official",
        verified_at=datetime(2026, 10, 2, 10, 0, 0, tzinfo=timezone.utc),
        details={"verified_badges": True},
    )
    session.commit()

    # Query history
    history = v_repo.get_history(account.id)
    assert len(history) == 2
    latest = v_repo.get_latest(account.id)
    assert latest is not None
    assert latest.status == "verified"
    assert latest.provider_account_id == "ig_12345678"

    # Test relationship on account
    session.refresh(account)
    assert len(account.verifications) == 2
    assert account.verifications[0].id == v2.id


def test_sync_state_persistence_and_metrics(session: Session):
    creator_repo = CreatorRepository(session)
    creator = Creator(handle="dhamtari_vibes", display_name="Dhamtari Vibes", district_id="dhamtari")
    creator_repo.create(creator)
    session.commit()

    acc_repo = SocialAccountRepository(session)
    account = SocialAccount(
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="dhamtari_vibes",
        profile_url="https://youtube.com/@dhamtari_vibes",
        status=SocialAccountStatus.ACTIVE.value,
    )
    acc_repo.create(account)
    session.commit()

    sync_repo = SocialSyncStateRepository(session)

    # 1. get_or_create
    state = sync_repo.get_or_create(account.id)
    session.commit()
    assert state.social_account_id == account.id
    assert state.sync_status == SyncStatus.NEVER_RUN.value

    # 2. 1:1 invariant
    duplicate_state = SocialAccountSyncState(
        social_account_id=account.id,
        sync_status=SyncStatus.NEVER_RUN.value,
    )
    session.add(duplicate_state)
    with pytest.raises(IntegrityError):
        session.commit()
    session.rollback()

    # 3. record_sync_success
    start_time = datetime.now(timezone.utc)
    updated_state = sync_repo.record_sync_success(
        account_id=account.id,
        discovered=10,
        created=8,
        updated=2,
        failed=0,
        cursor="cursor_page_2",
        etag="W/etag123",
        started_at=start_time,
    )
    session.commit()

    assert updated_state.sync_status == SyncStatus.SUCCEEDED.value
    assert updated_state.discovered_count == 10
    assert updated_state.created_count == 8
    assert updated_state.updated_count == 2
    assert updated_state.items_synced_total == 10
    assert updated_state.cursor == "cursor_page_2"
    assert updated_state.etag == "W/etag123"
    assert updated_state.last_started_at is not None
    assert updated_state.last_finished_at is not None


def test_canonical_content_deduplication_and_soft_delete(session: Session):
    creator_repo = CreatorRepository(session)
    creator = Creator(handle="chitrakote_guide", display_name="Chitrakote Guide", district_id="bastar")
    creator_repo.create(creator)
    session.commit()

    content_repo = SocialContentRepository(session)

    # 1. Insert canonical content
    content1 = SocialContent(
        creator_id=creator.id,
        provider="youtube",
        provider_content_id="YT_VIDEO_999",
        slug="monsoon-at-chitrakote-falls",
        title="Monsoon at Chitrakote Falls",
        platform=SocialPlatform.YOUTUBE.value,
        content_type=ContentType.VIDEO.value,
        publication_status=ContentStatus.PUBLISHED.value,
        visibility=ContentVisibility.PUBLIC.value,
        district_id="bastar",
        place_slug="chitrakote-waterfall",
    )
    content_repo.create(content1)
    session.commit()

    # 2. Query by provider content ID
    fetched = content_repo.get_by_provider_content("youtube", "YT_VIDEO_999")
    assert fetched is not None
    assert fetched.id == content1.id

    # 3. Inserting duplicate provider_content_id on same provider violates partial unique constraint
    duplicate_content = SocialContent(
        creator_id=creator.id,
        provider="youtube",
        provider_content_id="YT_VIDEO_999",
        slug="duplicate-monsoon-video",
        title="Duplicate Monsoon Video",
        platform=SocialPlatform.YOUTUBE.value,
        content_type=ContentType.VIDEO.value,
    )
    session.add(duplicate_content)
    with pytest.raises(IntegrityError):
        session.commit()
    session.rollback()

    # 4. Soft deletion preservation: mark source deleted
    content_repo.mark_source_deleted(content1.id)
    session.commit()

    re_fetched = content_repo.get_by_id(content1.id)
    assert re_fetched is not None
    assert re_fetched.source_status == SocialContentStatus.SOURCE_DELETED.value
    assert re_fetched.publication_status == ContentStatus.ARCHIVED.value


def test_polymorphic_content_context(session: Session):
    creator_repo = CreatorRepository(session)
    creator = Creator(handle="madai_fest", display_name="Madai Festivals", district_id="kondagaon")
    creator_repo.create(creator)
    session.commit()

    content_repo = SocialContentRepository(session)
    content = SocialContent(
        creator_id=creator.id,
        provider="instagram",
        provider_content_id="IG_POST_555",
        slug="kondagaon-bell-metal-crafting",
        title="Kondagaon Bell Metal Crafting",
        platform=SocialPlatform.INSTAGRAM.value,
        content_type=ContentType.POST.value,
        district_id="kondagaon",
    )
    content_repo.create(content)
    session.commit()

    context_repo = SocialContentContextRepository(session)

    # Attach multiple contexts
    ctx1 = context_repo.attach_context(
        content_id=content.id,
        context_type="district",
        context_id="kondagaon",
        source="system_resolver",
        confidence=1.0,
    )
    ctx2 = context_repo.attach_context(
        content_id=content.id,
        context_type="craft",
        context_id="dhokra-bell-metal",
        source="editorial",
        confidence=0.95,
        metadata_json={"artisan_village": "Bhelvapadar"},
    )
    session.commit()

    # Query contexts for content
    contexts = context_repo.get_contexts_for_content(content.id)
    assert len(contexts) == 2

    # Query content IDs by context
    content_ids = context_repo.get_contents_by_context("craft", "dhokra-bell-metal")
    assert content.id in content_ids

    # Query via model relationship
    session.refresh(content)
    assert len(content.contexts) == 2


def test_optimistic_locking_and_concurrency_collision(session: Session):
    creator_repo = CreatorRepository(session)
    creator = Creator(handle="kanker_tours", display_name="Kanker Tours", district_id="kanker")
    creator_repo.create(creator)
    session.commit()

    acc_repo = SocialAccountRepository(session)
    account = SocialAccount(
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="kanker_tours",
        profile_url="https://youtube.com/@kanker_tours",
        status=SocialAccountStatus.VERIFIED.value,
        version=1,
    )
    acc_repo.create(account)
    session.commit()

    # 1. Successful optimistic update
    updated_acc = acc_repo.update_optimistic(
        account_id=account.id,
        expected_version=1,
        priority=80,
    )
    session.commit()
    assert updated_acc.version == 2
    assert updated_acc.priority == 80

    # 2. Concurrency collision: expected_version 1 fails because current version is 2
    with pytest.raises(ConcurrencyStateConflictError) as exc_info:
        acc_repo.update_optimistic(
            account_id=account.id,
            expected_version=1,
            priority=90,
        )
    assert "version mismatch" in str(exc_info.value).lower()


def test_acceptance_service_atomic_row_locking_and_versioning(session: Session):
    creator_repo = CreatorRepository(session)
    creator = Creator(handle="bhoramdeo_trails", display_name="Bhoramdeo Trails", district_id="kawardha")
    creator_repo.create(creator)
    session.commit()

    acc_repo = SocialAccountRepository(session)
    account = SocialAccount(
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="bhoramdeo_trails",
        profile_url="https://youtube.com/@bhoramdeo_trails",
        status=SocialAccountStatus.VERIFIED.value,
        version=1,
    )
    acc_repo.create(account)
    session.commit()

    service = SocialAcceptanceService(session_or_repo=session)

    # Acceptance with correct expected_version
    accepted_acc = service.accept(
        account_id=account.id,
        expected_version=1,
        reason="Verified heritage guide",
    )
    assert accepted_acc.status == SocialAccountStatus.ACTIVE.value
    assert accepted_acc.version == 2

    # Attempting to accept again with stale version 1 raises ConcurrencyStateConflictError
    account.status = SocialAccountStatus.VERIFIED.value  # reset status for collision test
    session.commit()

    with pytest.raises(ConcurrencyStateConflictError):
        service.accept(
            account_id=account.id,
            expected_version=1,
            reason="Another review attempt",
        )
