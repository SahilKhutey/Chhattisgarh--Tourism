from __future__ import annotations

import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.modules.social.domain.enums import (
    ContentType,
    CreatorStatus,
    SocialAccountStatus,
    SocialContentStatus,
    SocialPlatform,
    SocialVisibility,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent


def test_admin_creator_activate_and_suspend_api(
    client: TestClient,
    admin_headers: dict[str, str],
    db_session: Session,
) -> None:
    creator = Creator(
        id=uuid.uuid4(),
        handle="chhattisgarh_trails",
        display_name="Chhattisgarh Trails",
        district_id="bastar",
        status=CreatorStatus.PENDING.value,
    )
    db_session.add(creator)
    db_session.commit()

    # 1. Activate Creator
    activate_res = client.post(
        f"/api/admin/creators/{creator.id}/activate",
        headers=admin_headers,
    )
    assert activate_res.status_code == 200, activate_res.text
    data = activate_res.json()
    assert data["id"] == str(creator.id)
    assert data["status"].upper() == "ACTIVE"

    # 2. Suspend Creator
    suspend_res = client.post(
        f"/api/admin/creators/{creator.id}/suspend",
        headers=admin_headers,
        json={"reason": "Terms of service violation"},
    )
    assert suspend_res.status_code == 200, suspend_res.text
    data_suspend = suspend_res.json()
    assert data_suspend["id"] == str(creator.id)
    assert data_suspend["status"].upper() == "SUSPENDED"


def test_admin_account_disconnect_api(
    client: TestClient,
    admin_headers: dict[str, str],
    db_session: Session,
) -> None:
    creator = Creator(
        id=uuid.uuid4(),
        handle="bastar_artisan",
        display_name="Bastar Artisan",
        district_id="bastar",
        status=CreatorStatus.ACTIVE.value,
    )
    account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="bastar_artisan",
        status=SocialAccountStatus.ACTIVE.value,
        sync_enabled=True,
    )
    db_session.add_all([creator, account])
    db_session.commit()

    res = client.post(
        f"/api/admin/accounts/{account.id}/disconnect",
        headers=admin_headers,
        json={"reason": "Revoked by creator request"},
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["id"] == str(account.id)
    assert data["status"].upper() == "DISCONNECTED"
    assert data["is_sync_enabled"] is False


def test_admin_moderation_hide_and_restore_api(
    client: TestClient,
    admin_headers: dict[str, str],
    db_session: Session,
) -> None:
    creator = Creator(
        id=uuid.uuid4(),
        handle="tribal_festivals",
        display_name="Tribal Festivals",
        district_id="bastar",
        status=CreatorStatus.ACTIVE.value,
    )
    account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="tribal_festivals",
        status=SocialAccountStatus.ACTIVE.value,
    )
    content = SocialContent(
        id=uuid.uuid4(),
        creator_id=creator.id,
        social_account_id=account.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_fest_01",
        content_type=ContentType.VIDEO.value,
        title="Madai Festival Dance",
        slug="madai-festival-dance",
        district_id="bastar",
        source_url="https://youtube.com/watch?v=yt_fest_01",
        publication_status=SocialContentStatus.PUBLISHED.value,
        visibility=SocialVisibility.PUBLIC.value,
    )
    db_session.add_all([creator, account, content])
    db_session.commit()

    # 1. Hide Content
    hide_res = client.post(
        f"/api/admin/moderation/{content.id}/hide?reason=Temporary+editorial+hold",
        headers=admin_headers,
    )
    assert hide_res.status_code == 200, hide_res.text
    hide_data = hide_res.json()
    assert hide_data["publication_status"].upper() == "HIDDEN"
    assert hide_data["visibility"].upper() == "HIDDEN"

    # 2. Restore Content
    restore_res = client.post(
        f"/api/admin/moderation/{content.id}/restore",
        headers=admin_headers,
    )
    assert restore_res.status_code == 200, restore_res.text
    restore_data = restore_res.json()
    assert restore_data["publication_status"].upper() == "PUBLISHED"
    assert restore_data["visibility"].upper() == "PUBLIC"


def test_admin_moderation_tourism_context_api(
    client: TestClient,
    admin_headers: dict[str, str],
    db_session: Session,
) -> None:
    creator = Creator(
        id=uuid.uuid4(),
        handle="teerathgarh_scout",
        display_name="Teerathgarh Scout",
        district_id="bastar",
        status=CreatorStatus.ACTIVE.value,
    )
    content = SocialContent(
        id=uuid.uuid4(),
        creator_id=creator.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_teerath_01",
        content_type=ContentType.VIDEO.value,
        title="Teerathgarh Falls in Morning Light",
        slug="teerathgarh-falls-morning-light",
        district_id="bastar",
        source_url="https://youtube.com/watch?v=yt_teerath_01",
        publication_status=SocialContentStatus.PUBLISHED.value,
    )
    db_session.add_all([creator, content])
    db_session.commit()

    payload = {
        "district_id": "bastar",
        "place_slug": "teerathgarh-falls",
        "place_name": "Teerathgarh Falls",
        "tourism_zone_id": "bastar_tribal",
        "festival_name": None,
    }
    res = client.post(
        f"/api/admin/moderation/{content.id}/tourism-context",
        headers=admin_headers,
        json=payload,
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["district_id"] == "bastar"
    assert data["place_slug"] == "teerathgarh-falls"
    assert data["place_id"] is not None


def test_admin_content_list_and_get_api(
    client: TestClient,
    admin_headers: dict[str, str],
    db_session: Session,
) -> None:
    creator = Creator(
        id=uuid.uuid4(),
        handle="mainpat_explorer",
        display_name="Mainpat Explorer",
        district_id="surguja",
        status=CreatorStatus.ACTIVE.value,
    )
    content = SocialContent(
        id=uuid.uuid4(),
        creator_id=creator.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_mainpat_01",
        content_type=ContentType.VIDEO.value,
        title="Tibetan Settlement at Mainpat",
        slug="tibetan-settlement-mainpat",
        district_id="surguja",
        source_url="https://youtube.com/watch?v=yt_mainpat_01",
        publication_status=SocialContentStatus.PUBLISHED.value,
    )
    db_session.add_all([creator, content])
    db_session.commit()

    # 1. List Content Filtered
    list_res = client.get(
        "/api/admin/content?district_id=surguja",
        headers=admin_headers,
    )
    assert list_res.status_code == 200, list_res.text
    items = list_res.json()
    assert len(items) >= 1
    assert any(item["slug"] == "tibetan-settlement-mainpat" for item in items)

    # 2. Get Single Content Item
    get_res = client.get(
        f"/api/admin/content/{content.id}",
        headers=admin_headers,
    )
    assert get_res.status_code == 200, get_res.text
    assert get_res.json()["id"] == str(content.id)

    # 3. 404 for Unknown Content
    unknown_res = client.get(
        f"/api/admin/content/{uuid.uuid4()}",
        headers=admin_headers,
    )
    assert unknown_res.status_code == 404
