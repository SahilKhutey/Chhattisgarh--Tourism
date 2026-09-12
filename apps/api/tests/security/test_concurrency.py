import uuid
from app.modules.content_entries.models import ContentEntry
from app.modules.content_template.models import ContentTemplate, TemplateVersion, TemplateVersionField


def test_if_match_optimistic_locking(db_session, admin_client):
    tpl_id = uuid.uuid4()
    ver_id = uuid.uuid4()
    tpl = ContentTemplate(
        id=tpl_id,
        name="Concurrency Template",
        slug="concurrency-template",
        status="PUBLISHED",
    )
    db_session.add(tpl)

    ver = TemplateVersion(
        id=ver_id,
        template_id=tpl_id,
        version_number=1,
        name="Concurrency v1",
        slug="concurrency-v1",
        schema_hash="concurrency-hash",
        created_by="admin",
    )
    db_session.add(ver)

    f1 = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=ver_id,
        key="note",
        label="Note",
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
        slug="concurrency-entry",
        title="Concurrency Test",
        status="DRAFT",
        values={"note": "Initial version"},
        revision=1,
        created_by="admin",
        updated_by="admin",
    )
    db_session.add(entry)
    db_session.commit()

    # 1. Update with correct If-Match ("1") -> 200 and revision becomes 2
    res_correct = admin_client.patch(
        f"/api/admin/content-entries/{entry.id}",
        headers={"If-Match": '"1"'},
        json={
            "revision": 1,
            "title": "First Update",
            "values": {"note": "First update content"},
        },
    )
    assert res_correct.status_code == 200
    assert res_correct.json()["revision"] == 2

    # 2. Update with stale If-Match ("1") -> 412 PRECONDITION FAILED
    res_stale = admin_client.patch(
        f"/api/admin/content-entries/{entry.id}",
        headers={"If-Match": '"1"'},
        json={
            "revision": 1,
            "title": "Stale Update Attempt",
            "values": {"note": "Should be rejected"},
        },
    )
    assert res_stale.status_code == 412
