import uuid
from fastapi import HTTPException, status
from app.main import app
from app.modules.admin.dependencies import AdminUser, get_current_user


def test_publish_creates_version(client, template):
    # Add initial field to draft
    payload = {
        "fields": [
            {
                "key": "title",
                "label": "Title",
                "type": "TEXT",
                "order": 0,
                "required": True,
                "translatable": True,
                "config": {},
            }
        ]
    }
    res = client.patch(f"/api/admin/templates/{template.id}/fields", json=payload)
    assert res.status_code == 200

    # Publish
    res_pub = client.post(f"/api/admin/templates/{template.id}/publish")
    assert res_pub.status_code == 200
    pub_data = res_pub.json()
    assert pub_data["version_number"] == 1
    assert pub_data["status"] == "PUBLISHED"
    assert pub_data["schema_hash"] is not None


def test_second_publish_creates_version_two(client, template):
    # Setup v1
    client.patch(
        f"/api/admin/templates/{template.id}/fields",
        json={
            "fields": [
                {
                    "key": "title",
                    "label": "Title",
                    "type": "TEXT",
                    "order": 0,
                    "required": True,
                    "translatable": True,
                    "config": {},
                }
            ]
        },
    )
    res_v1 = client.post(f"/api/admin/templates/{template.id}/publish")
    assert res_v1.status_code == 200
    assert res_v1.json()["version_number"] == 1

    # Unlock draft to edit
    res_unlock = client.post(f"/api/admin/templates/{template.id}/draft")
    assert res_unlock.status_code == 200
    assert res_unlock.json()["status"] == "DRAFT"

    # Add second field to draft
    client.patch(
        f"/api/admin/templates/{template.id}/fields",
        json={
            "fields": [
                {
                    "key": "title",
                    "label": "Title",
                    "type": "TEXT",
                    "order": 0,
                    "required": True,
                    "translatable": True,
                    "config": {},
                },
                {
                    "key": "description",
                    "label": "Description",
                    "type": "TEXTAREA",
                    "order": 1,
                    "required": False,
                    "translatable": True,
                    "config": {},
                },
            ]
        },
    )

    # Publish v2
    res_v2 = client.post(f"/api/admin/templates/{template.id}/publish")
    assert res_v2.status_code == 200
    assert res_v2.json()["version_number"] == 2


def test_rollback_moves_published_pointer_and_retains_versions(client, template):
    # Publish v1
    client.patch(
        f"/api/admin/templates/{template.id}/fields",
        json={
            "fields": [
                {
                    "key": "title",
                    "label": "Title",
                    "type": "TEXT",
                    "order": 0,
                    "required": True,
                    "translatable": True,
                    "config": {},
                }
            ]
        },
    )
    client.post(f"/api/admin/templates/{template.id}/publish")

    # Unlock & Publish v2
    client.post(f"/api/admin/templates/{template.id}/draft")
    client.patch(
        f"/api/admin/templates/{template.id}/fields",
        json={
            "fields": [
                {
                    "key": "title",
                    "label": "Title",
                    "type": "TEXT",
                    "order": 0,
                    "required": True,
                    "translatable": True,
                    "config": {},
                },
                {
                    "key": "gallery",
                    "label": "Gallery",
                    "type": "GALLERY",
                    "order": 1,
                    "required": False,
                    "translatable": False,
                    "config": {"require_alt_text": True},
                },
            ]
        },
    )
    client.post(f"/api/admin/templates/{template.id}/publish")

    # Rollback to v1
    res_rb = client.post(
        f"/api/admin/templates/{template.id}/rollback",
        json={"version_number": 1},
    )
    assert res_rb.status_code == 200
    assert res_rb.json()["version_number"] == 1

    # Verify both versions still exist
    res_list = client.get(f"/api/admin/templates/{template.id}/versions")
    assert res_list.status_code == 200
    items = res_list.json()["items"]
    assert len(items) == 2
    v_nums = [item["version_number"] for item in items]
    assert 1 in v_nums and 2 in v_nums

    # Verify live pointer is version 1
    v1_item = next(i for i in items if i["version_number"] == 1)
    assert v1_item["is_published"] is True
    v2_item = next(i for i in items if i["version_number"] == 2)
    assert v2_item["is_published"] is False


def test_cannot_rollback_nonexistent_version(client, template):
    res = client.post(
        f"/api/admin/templates/{template.id}/rollback",
        json={"version_number": 999999},
    )
    assert res.status_code == 404


def test_versions_require_auth(client, template):
    def no_auth():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    app.dependency_overrides[get_current_user] = no_auth
    try:
        res = client.get(f"/api/admin/templates/{template.id}/versions")
        assert res.status_code == 401
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_unauthorized_role_cannot_rollback(client, template):
    creator = AdminUser(id=uuid.uuid4(), role="CREATOR", active=True)
    app.dependency_overrides[get_current_user] = lambda: creator

    try:
        res = client.post(
            f"/api/admin/templates/{template.id}/rollback",
            json={"version_number": 1},
        )
        assert res.status_code == 403
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_version_detail_and_diff(client, template):
    # Create v1
    client.patch(
        f"/api/admin/templates/{template.id}/fields",
        json={
            "fields": [
                {
                    "key": "title",
                    "label": "Old Title",
                    "type": "TEXT",
                    "order": 0,
                    "required": True,
                    "translatable": True,
                    "config": {},
                }
            ]
        },
    )
    client.post(f"/api/admin/templates/{template.id}/publish")

    # Create v2 with breaking change (new required field) and changed label
    client.post(f"/api/admin/templates/{template.id}/draft")
    client.patch(
        f"/api/admin/templates/{template.id}/fields",
        json={
            "fields": [
                {
                    "key": "title",
                    "label": "New Title",
                    "type": "TEXT",
                    "order": 0,
                    "required": True,
                    "translatable": True,
                    "config": {},
                },
                {
                    "key": "location",
                    "label": "Geo Location",
                    "type": "GEO_POINT",
                    "order": 1,
                    "required": True,
                    "translatable": False,
                    "config": {},
                },
            ]
        },
    )
    client.post(f"/api/admin/templates/{template.id}/publish")

    # Fetch detail of v2
    res_detail = client.get(f"/api/admin/templates/{template.id}/versions/2")
    assert res_detail.status_code == 200
    assert res_detail.json()["version_number"] == 2
    assert len(res_detail.json()["fields"]) == 2

    # Fetch diff of v2 against v1 (previous)
    res_diff = client.get(f"/api/admin/templates/{template.id}/versions/2/diff?against=previous")
    assert res_diff.status_code == 200
    diff_data = res_diff.json()
    assert diff_data["version"] == 2
    assert diff_data["against"] == 1
    assert diff_data["breaking"] is True
    assert diff_data["risk"]["risk_level"] == "HIGH"
    assert len(diff_data["added"]) == 1
    assert diff_data["added"][0]["key"] == "location"
    assert any(c["change"] == "LABEL_CHANGED" for c in diff_data["changed"])

    # First version diff has no previous
    res_diff1 = client.get(f"/api/admin/templates/{template.id}/versions/1/diff?against=previous")
    assert res_diff1.status_code == 200
    assert res_diff1.json()["against"] is None
    assert res_diff1.json()["diff"] is None
