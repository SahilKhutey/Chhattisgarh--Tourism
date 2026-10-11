import uuid
import pytest
from fastapi.testclient import TestClient

from app.core.database import get_db
from app.main import app
from app.modules.admin.dependencies import AdminUser
from app.modules.social.api.dependencies import require_admin
from app.modules.social.domain.enums import (
    CreatorStatus,
    ProviderAccessStatus,
    SocialAccountStatus,
    SyncStatus,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.sync_state import SocialAccountSyncState


@pytest.fixture
def mock_admin():
    return AdminUser(
        id=uuid.uuid4(),
        role="ADMIN",
        active=True,
    )


@pytest.fixture
def client(session, mock_admin):
    app.dependency_overrides[get_db] = lambda: session
    app.dependency_overrides[require_admin] = lambda: mock_admin
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def db_creator(session):
    c = Creator(
        id=uuid.uuid4(),
        display_name="Ravi Bastar",
        slug="ravi-bastar",
        bio="Bastar Culture",
        status=CreatorStatus.ACTIVE.value,
        district_id="bastar",
    )
    session.add(c)
    session.commit()
    return c


def test_health_social(client):
    res = client.get("/health/social")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ("ok", "healthy")
    assert data["providers"]["youtube"] == "configured"
    assert data["providers"]["instagram"] == "configured"
    assert data["worker"] == "healthy"
    assert data["scheduler"] == "healthy"
    assert "youtube" in data["supported_platforms"]
    assert "instagram" in data["supported_platforms"]
    assert data["worker_ready"] is True
    assert data["scheduler_ready"] is True


def test_register_and_list_handles_api(client, db_creator):
    # Register YouTube handle
    payload = {
        "creator_id": str(db_creator.id),
        "platform": "youtube",
        "handle": "@BastarTravels",
        "sync_enabled": False,
        "display_name": "Bastar Travels Official",
    }
    res = client.post("/api/admin/handles", json=payload)
    assert res.status_code == 201
    created = res.json()
    assert created["handle"] == "bastartravels"
    assert created["platform"] == "youtube"
    assert created["status"] == "pending"

    # Duplicate registration on same platform rejected with 400 or 409
    res_dup = client.post("/api/admin/handles", json=payload)
    assert res_dup.status_code in (400, 409)

    # List handles
    res_list = client.get(f"/api/admin/handles?creator_id={db_creator.id}")
    assert res_list.status_code == 200
    items = res_list.json()
    assert len(items) >= 1
    assert any(i["handle"] == "bastartravels" for i in items)


def test_account_sync_management_api(client, session, db_creator):
    # Create active social account
    acc = SocialAccount(
        id=uuid.uuid4(),
        creator_id=db_creator.id,
        platform="youtube",
        handle="cg_active_sync",
        profile_url="https://youtube.com/@cg_active_sync",
        status=SocialAccountStatus.ACTIVE.value,
        sync_status=SyncStatus.NEVER_RUN.value,
        is_sync_enabled=True,
        provider_access_status=ProviderAccessStatus.AVAILABLE.value,
    )
    session.add(acc)
    state = SocialAccountSyncState(
        social_account_id=acc.id,
        sync_status=SyncStatus.NEVER_RUN.value,
        sync_enabled=True,
    )
    session.add(state)
    session.commit()

    # 1. Trigger manual sync -> 202 Accepted
    res_sync = client.post(f"/api/admin/accounts/{acc.id}/sync")
    assert res_sync.status_code == 202
    sync_resp = res_sync.json()
    assert sync_resp["status"] == "accepted"
    assert sync_resp["account_id"] == str(acc.id)
    assert "run_id" in sync_resp

    # 2. Get sync-state
    res_state = client.get(f"/api/admin/accounts/{acc.id}/sync-state")
    assert res_state.status_code == 200
    state_data = res_state.json()
    assert state_data["social_account_id"] == str(acc.id)
    assert state_data["sync_enabled"] is True

    # 3. Pause sync
    res_pause = client.post(f"/api/admin/accounts/{acc.id}/pause-sync")
    assert res_pause.status_code == 200
    assert res_pause.json()["is_sync_enabled"] is False

    # 4. Resume sync
    res_resume = client.post(f"/api/admin/accounts/{acc.id}/resume-sync")
    assert res_resume.status_code == 200
    assert res_resume.json()["is_sync_enabled"] is True

    # 5. List sync-runs
    res_runs = client.get(f"/api/admin/accounts/{acc.id}/sync-runs")
    assert res_runs.status_code == 200
    assert isinstance(res_runs.json(), list)


def test_admin_social_prefixed_endpoints(client, session, db_creator):
    # Verify handle endpoint
    res_verify = client.post(
        "/api/admin/social/handles/verify",
        json={"platform": "youtube", "handle": "@bastar_traveler"},
    )
    assert res_verify.status_code == 200
    assert res_verify.json()["normalized_handle"] == "bastar_traveler"
    assert res_verify.json()["verified"] is True

    # Register via /api/admin/social/handles
    payload = {
        "creator_id": str(db_creator.id),
        "platform": "youtube",
        "handle": "@bastar_traveler",
        "sync_enabled": False,
    }
    res_reg = client.post("/api/admin/social/handles", json=payload)
    assert res_reg.status_code == 201
    acc_data = res_reg.json()
    acc_id = acc_data["id"]

    # List via /api/admin/social/handles
    res_list = client.get(f"/api/admin/social/handles?creator_id={db_creator.id}")
    assert res_list.status_code == 200
    assert any(a["id"] == acc_id for a in res_list.json())

    # Verify account via /api/admin/social/accounts/{id}/verify
    res_acc_ver = client.post(f"/api/admin/social/accounts/{acc_id}/verify")
    assert res_acc_ver.status_code == 200

    # Sync-state via /api/admin/social/accounts/{id}/sync-state
    res_state = client.get(f"/api/admin/social/accounts/{acc_id}/sync-state")
    assert res_state.status_code == 200

    # Sync-runs via /api/admin/social/accounts/{id}/sync-runs
    res_runs = client.get(f"/api/admin/social/accounts/{acc_id}/sync-runs")
    assert res_runs.status_code == 200

    # Pause-sync via /api/admin/social/accounts/{id}/pause-sync
    res_pause = client.post(f"/api/admin/social/accounts/{acc_id}/pause-sync")
    assert res_pause.status_code == 200
    assert res_pause.json()["is_sync_enabled"] is False

    # Resume-sync via /api/admin/social/accounts/{id}/resume-sync
    res_resume = client.post(f"/api/admin/social/accounts/{acc_id}/resume-sync")
    assert res_resume.status_code == 200
    assert res_resume.json()["is_sync_enabled"] is True

    # Consumer GET /api/social/feed
    res_feed = client.get("/api/social/feed")
    assert res_feed.status_code == 200
    assert isinstance(res_feed.json(), list)
