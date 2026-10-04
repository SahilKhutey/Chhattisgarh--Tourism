import uuid
import pytest
from fastapi.testclient import TestClient

from app.modules.social.domain.enums import CreatorStatus, SocialAccountStatus, SocialPlatform
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount


def test_admin_validate_creator_api(client: TestClient, admin_headers: dict[str, str]):
    # Valid creator
    res = client.post(
        "/api/admin/creators/validate",
        headers=admin_headers,
        json={
            "handle": "dholkal_guide",
            "display_name": "Dholkal Ganesha Guide",
            "district_id": "dantewada",
            "bio": "Guiding pilgrims and adventure trekkers to Dholkal peak.",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert len(data["issues"]) == 0

    # Invalid creator (empty display name)
    res_invalid = client.post(
        "/api/admin/creators/validate",
        headers=admin_headers,
        json={
            "handle": "dholkal_guide",
            "display_name": "   ",
            "district_id": "dantewada",
        },
    )
    assert res_invalid.status_code == 200
    data_inv = res_invalid.json()
    assert data_inv["valid"] is False
    assert any(i["field"] == "display_name" for i in data_inv["issues"])


def test_admin_check_creator_duplicates_api(
    client: TestClient,
    admin_headers: dict[str, str],
    db_session,
):
    creator = Creator(
        handle="bastar_trekkers",
        display_name="Bastar Trekkers Official",
        district_id="bastar",
        status=CreatorStatus.ACTIVE.value,
    )
    db_session.add(creator)
    db_session.commit()

    res = client.post(
        "/api/admin/creators/duplicates",
        headers=admin_headers,
        params={"display_name": "Bastar Trekkers", "district_id": "bastar"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "possible_duplicates" in data
    assert len(data["possible_duplicates"]) >= 1
    assert data["possible_duplicates"][0]["handle"] == "bastar_trekkers"


def test_admin_account_acceptance_lifecycle_api(
    client: TestClient,
    admin_headers: dict[str, str],
    db_session,
):
    creator = Creator(
        handle="chitrakote_lens",
        display_name="Chitrakote Waterfall Lens",
        district_id="bastar",
        status=CreatorStatus.ACTIVE.value,
    )
    db_session.add(creator)
    db_session.flush()

    account = SocialAccount(
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="chitrakote_lens",
        profile_url="https://youtube.com/@chitrakote_lens",
        status=SocialAccountStatus.VERIFIED.value,
    )
    db_session.add(account)
    db_session.commit()

    acc_id = str(account.id)

    # 1. Check eligibility before acceptance
    res_elig = client.get(f"/api/admin/accounts/{acc_id}/eligibility", headers=admin_headers)
    assert res_elig.status_code == 200
    elig_data = res_elig.json()
    assert elig_data["can_sync"] is False
    assert elig_data["status"] == SocialAccountStatus.VERIFIED.value

    # 2. Submit for acceptance
    res_sub = client.post(f"/api/admin/accounts/{acc_id}/submit", headers=admin_headers)
    assert res_sub.status_code == 200
    assert res_sub.json()["status"] == SocialAccountStatus.PENDING_ACCEPTANCE.value

    # 3. Accept account
    res_acc = client.post(
        f"/api/admin/accounts/{acc_id}/accept",
        headers=admin_headers,
        json={
            "approved_content_types": ["VIDEO", "SHORT"],
            "priority": 90,
            "reason": "Authentic Chitrakote tourism coverage",
        },
    )
    assert res_acc.status_code == 200
    accepted_data = res_acc.json()
    assert accepted_data["status"] == SocialAccountStatus.ACTIVE.value
    assert accepted_data["is_sync_enabled"] is True

    # 4. Check eligibility after acceptance
    res_elig_after = client.get(f"/api/admin/accounts/{acc_id}/eligibility", headers=admin_headers)
    assert res_elig_after.status_code == 200
    assert res_elig_after.json()["can_sync"] is True
    assert res_elig_after.json()["can_display"] is True


def test_admin_account_rejection_api(
    client: TestClient,
    admin_headers: dict[str, str],
    db_session,
):
    creator = Creator(
        handle="irrelevant_channel",
        display_name="Crypto Trades",
        district_id="raipur",
        status=CreatorStatus.ACTIVE.value,
    )
    db_session.add(creator)
    db_session.flush()

    account = SocialAccount(
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="crypto_trades",
        profile_url="https://youtube.com/@crypto_trades",
        status=SocialAccountStatus.PENDING_ACCEPTANCE.value,
    )
    db_session.add(account)
    db_session.commit()

    acc_id = str(account.id)

    # Rejection without reason fails
    res_bad = client.post(
        f"/api/admin/accounts/{acc_id}/reject",
        headers=admin_headers,
        json={"reason": "   "},
    )
    assert res_bad.status_code == 422

    # Valid rejection
    res_rej = client.post(
        f"/api/admin/accounts/{acc_id}/reject",
        headers=admin_headers,
        json={
            "reason": "Cryptocurrency content does not promote Chhattisgarh tourism",
            "reason_code": "NOT_RELEVANT",
        },
    )
    assert res_rej.status_code == 200
    data = res_rej.json()
    assert data["status"] == SocialAccountStatus.REJECTED.value
    assert data["is_sync_enabled"] is False


def test_admin_account_request_changes_api(
    client: TestClient,
    admin_headers: dict[str, str],
    db_session,
):
    creator = Creator(
        handle="kanger_explorer",
        display_name="Kanger Valley Explorer",
        district_id="bastar",
        status=CreatorStatus.ACTIVE.value,
    )
    db_session.add(creator)
    db_session.flush()

    account = SocialAccount(
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="kanger_explorer",
        profile_url="https://youtube.com/@kanger_explorer",
        status=SocialAccountStatus.PENDING_ACCEPTANCE.value,
    )
    db_session.add(account)
    db_session.commit()

    acc_id = str(account.id)

    res = client.post(
        f"/api/admin/accounts/{acc_id}/request-changes",
        headers=admin_headers,
        json={
            "reason": "Please link official website in channel description.",
            "requested_fields": ["bio", "website_url"],
        },
    )
    assert res.status_code == 200
    assert res.json()["status"] == SocialAccountStatus.PENDING.value
