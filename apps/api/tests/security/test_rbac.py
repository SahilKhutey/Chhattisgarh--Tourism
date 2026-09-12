import uuid
import pytest
from app.modules.content_entries.models import ContentEntry
from app.modules.content_template.models import ContentTemplate, TemplateVersion, TemplateVersionField
from app.modules.localization.models import Locale


def test_rbac_enforcement_creator_vs_moderator(
    db_session,
    creator_client,
    moderator_client,
    public_client,
):
    loc = Locale(code="en", name="English", native_name="English", is_default=True, enabled=True)
    db_session.add(loc)

    tpl_id = uuid.uuid4()
    ver_id = uuid.uuid4()
    tpl = ContentTemplate(
        id=tpl_id,
        name="RBAC Template",
        slug="rbac-template",
        status="PUBLISHED",
    )
    db_session.add(tpl)

    ver = TemplateVersion(
        id=ver_id,
        template_id=tpl_id,
        version_number=1,
        name="RBAC v1",
        slug="rbac-v1",
        schema_hash="rbac-hash",
        created_by="admin",
    )
    db_session.add(ver)

    f1 = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=ver_id,
        key="name",
        label="Name",
        type="TEXT",
        required=True,
        translatable=False,
        order=1,
    )
    db_session.add(f1)
    tpl.published_version_id = ver.id

    entry = ContentEntry(
        id=uuid.uuid4(),
        template_id=tpl_id,
        template_version_id=ver_id,
        slug="rbac-entry-draft",
        title="RBAC Entry Draft",
        status="DRAFT",
        values={"name": "Protected Content"},
        created_by="creator",
        updated_by="creator",
    )
    db_session.add(entry)
    db_session.commit()

    # 1. Creator attempts to publish -> 403 FORBIDDEN
    pub_creator_res = creator_client.post(f"/api/admin/content-entries/{entry.id}/publish")
    assert pub_creator_res.status_code == 403

    # 2. Anonymous client attempts to publish -> 401 UNAUTHORIZED
    pub_anon_res = public_client.post(f"/api/admin/content-entries/{entry.id}/publish")
    assert pub_anon_res.status_code == 401

    # 3. Moderator attempts to publish -> 200 SUCCESS
    pub_mod_res = moderator_client.post(f"/api/admin/content-entries/{entry.id}/publish")
    assert pub_mod_res.status_code == 200
    assert pub_mod_res.json()["status"] == "PUBLISHED"
