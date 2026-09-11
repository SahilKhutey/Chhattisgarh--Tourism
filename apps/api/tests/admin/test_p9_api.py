import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.modules.admin.dependencies import AdminUser, get_current_user
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_template.models.template import ContentTemplate
from app.modules.content_template.models.template_version import (
    TemplateVersion,
    TemplateVersionField,
)
from app.modules.localization.seed import seed_locales


def test_list_locales_api(client, db_session):
    seed_locales(db_session)
    res = client.get("/api/admin/localization/locales")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 3
    codes = [item["code"] for item in data]
    assert "en" in codes
    assert "hi" in codes
    assert "chg" in codes


def test_update_template_localization_api(client, db_session):
    seed_locales(db_session)
    template = ContentTemplate(
        id=uuid.uuid4(),
        name="Dest",
        slug="dest",
        status="DRAFT",
    )
    db_session.add(template)
    db_session.commit()

    res = client.patch(
        f"/api/admin/localization/templates/{template.id}",
        json={
            "locale_code": "hi",
            "name": "पर्यटन स्थल",
            "description": "विवरण",
        },
    )
    assert res.status_code == 200
    assert res.json()["name"] == "पर्यटन स्थल"

    # Unknown template
    fake_id = uuid.uuid4()
    res_404 = client.patch(
        f"/api/admin/localization/templates/{fake_id}",
        json={"locale_code": "hi", "name": "Test"},
    )
    assert res_404.status_code == 404

    # Invalid locale
    res_422 = client.patch(
        f"/api/admin/localization/templates/{template.id}",
        json={"locale_code": "unsupported_locale_code", "name": "Test"},
    )
    assert res_422.status_code == 422


def test_non_translatable_field_returns_422(client, db_session):
    seed_locales(db_session)
    template_id = uuid.uuid4()
    version_id = uuid.uuid4()

    version = TemplateVersion(
        id=version_id,
        template_id=template_id,
        version_number=1,
        name="Dest",
        slug="dest",
        schema_hash="hash",
        created_by="admin",
    )
    db_session.add(version)

    field = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=version_id,
        key="latitude",
        label="Latitude",
        type="NUMBER",
        required=True,
        translatable=False,
        order=1,
    )
    db_session.add(field)

    entry = ContentEntry(
        id=uuid.uuid4(),
        template_id=template_id,
        template_version_id=version_id,
        slug="entry-loc",
        title="Bastar",
        status="DRAFT",
        values={"latitude": 19.5},
        revision=1,
        created_by="admin",
        updated_by="admin",
    )
    db_session.add(entry)
    db_session.commit()

    res = client.patch(
        f"/api/admin/localization/content/{entry.id}/fields/latitude",
        json={
            "locale_code": "hi",
            "field_key": "latitude",
            "value": "19.5",
        },
    )
    assert res.status_code == 422
    assert res.json()["detail"]["code"] == "FIELD_NOT_TRANSLATABLE"
    assert res.json()["detail"]["field_key"] == "latitude"


def test_glossary_api_lifecycle(client, db_session):
    # 1. Create term
    res = client.post(
        "/api/admin/glossary",
        json={
            "key": "waterfall",
            "definition": "Vertical water descent",
            "context": "Nature",
            "preferred": True,
            "deprecated": False,
            "translations": [
                {"locale_code": "en", "term": "Waterfall", "synonyms": ["Falls"]},
                {"locale_code": "hi", "term": "जलप्रपात", "synonyms": []},
            ],
        },
    )
    assert res.status_code == 201
    term_id = res.json()["id"]
    assert res.json()["key"] == "waterfall"

    # 2. Duplicate key conflict (409)
    res_dup = client.post(
        "/api/admin/glossary",
        json={"key": "waterfall", "definition": "duplicate"},
    )
    assert res_dup.status_code == 409

    # 3. List
    res_list = client.get("/api/admin/glossary")
    assert res_list.status_code == 200
    assert any(t["key"] == "waterfall" for t in res_list.json())

    # 4. Patch
    res_patch = client.patch(
        f"/api/admin/glossary/{term_id}",
        json={"definition": "Updated definition", "deprecated": True},
    )
    assert res_patch.status_code == 200
    assert res_patch.json()["deprecated"] is True

    # 5. Delete
    res_del = client.delete(f"/api/admin/glossary/{term_id}")
    assert res_del.status_code == 200

    # 404 on re-delete
    res_del_404 = client.delete(f"/api/admin/glossary/{term_id}")
    assert res_del_404.status_code == 404


def test_accessibility_api(client, db_session):
    template_id = uuid.uuid4()
    version_id = uuid.uuid4()

    version = TemplateVersion(
        id=version_id,
        template_id=template_id,
        version_number=1,
        name="Dest",
        slug="dest",
        schema_hash="hash",
        created_by="admin",
    )
    db_session.add(version)

    field = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=version_id,
        key="cover",
        label="Cover Image",
        type="IMAGE",
        required=True,
        translatable=False,
        order=1,
    )
    db_session.add(field)

    entry = ContentEntry(
        id=uuid.uuid4(),
        template_id=template_id,
        template_version_id=version_id,
        slug="entry-img",
        title="Cover Place",
        status="DRAFT",
        values={"cover": {"url": "img.jpg"}},  # missing alt
        revision=1,
        created_by="admin",
        updated_by="admin",
    )
    db_session.add(entry)
    db_session.commit()

    # Post audit
    res = client.post(f"/api/admin/accessibility/entries/{entry.id}/audit")
    assert res.status_code == 200
    assert res.json()["status"] == "FAIL"
    assert res.json()["score"] == 80

    # Get summary
    res_sum = client.get("/api/admin/accessibility/audit")
    assert res_sum.status_code == 200
    assert res_sum.json()["total"] >= 1


def test_publication_blocked_by_missing_image_alt(client, db_session):
    seed_locales(db_session)
    template_id = uuid.uuid4()
    version_id = uuid.uuid4()

    version = TemplateVersion(
        id=version_id,
        template_id=template_id,
        version_number=1,
        name="Dest",
        slug="dest",
        schema_hash="hash",
        created_by="admin",
    )
    db_session.add(version)

    field1 = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=version_id,
        key="hero_image",
        label="Hero Image",
        type="IMAGE",
        required=True,
        translatable=False,
        order=1,
    )
    db_session.add(field1)

    entry = ContentEntry(
        id=uuid.uuid4(),
        template_id=template_id,
        template_version_id=version_id,
        slug="entry-blocked",
        title="Blocked Entry",
        status="DRAFT",
        values={"hero_image": {"url": "hero.jpg"}},  # missing alt text
        revision=1,
        created_by="admin",
        updated_by="admin",
    )
    db_session.add(entry)
    db_session.commit()

    pub_res = client.post(f"/api/admin/content-entries/{entry.id}/publish")
    assert pub_res.status_code == 409
    detail = pub_res.json()["detail"]
    assert detail["code"] == "ACCESSIBILITY_GATE_FAILED"
    assert any(
        i["code"] == "IMAGE_ALT_REQUIRED" and i["severity"] == "BLOCKER"
        for i in detail["issues"]
    )


def test_rbac_unauthenticated_and_forbidden():
    with TestClient(app) as unauth_client:
        res = unauth_client.get("/api/admin/glossary")
        assert res.status_code == 401

    # CREATOR attempting glossary write
    creator = AdminUser(id=uuid.uuid4(), role="CREATOR", active=True)

    def override_get_user():
        return creator

    app.dependency_overrides[get_current_user] = override_get_user
    with TestClient(app) as creator_client:
        res = creator_client.post(
            "/api/admin/glossary",
            json={"key": "test_term"},
        )
        assert res.status_code == 403
    app.dependency_overrides.clear()
