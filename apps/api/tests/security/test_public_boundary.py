import uuid
from app.modules.content_entries.models import ContentEntry
from app.modules.content_template.models import ContentTemplate, TemplateVersion, TemplateVersionField


def test_public_boundary_hides_draft_and_review(db_session, public_client):
    tpl_id = uuid.uuid4()
    ver_id = uuid.uuid4()
    tpl = ContentTemplate(
        id=tpl_id,
        name="Security Boundary Template",
        slug="sec-template",
        status="PUBLISHED",
    )
    db_session.add(tpl)

    ver = TemplateVersion(
        id=ver_id,
        template_id=tpl_id,
        version_number=1,
        name="Sec v1",
        slug="sec-v1",
        schema_hash="sec-hash",
        created_by="admin",
    )
    db_session.add(ver)

    f1 = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=ver_id,
        key="secret_notes",
        label="Internal Notes",
        type="TEXT",
        required=False,
        translatable=False,
        order=1,
    )
    db_session.add(f1)
    tpl.published_version_id = ver.id

    draft_entry = ContentEntry(
        id=uuid.uuid4(),
        template_id=tpl_id,
        template_version_id=ver_id,
        slug="draft-secret-place",
        title="Draft Secret Place",
        status="DRAFT",
        values={"secret_notes": "Internal only"},
        created_by="admin",
        updated_by="admin",
    )

    review_entry = ContentEntry(
        id=uuid.uuid4(),
        template_id=tpl_id,
        template_version_id=ver_id,
        slug="review-secret-place",
        title="Review Secret Place",
        status="IN_REVIEW",
        values={"secret_notes": "Awaiting approval"},
        created_by="admin",
        updated_by="admin",
    )

    archived_entry = ContentEntry(
        id=uuid.uuid4(),
        template_id=tpl_id,
        template_version_id=ver_id,
        slug="archived-place",
        title="Archived Place",
        status="ARCHIVED",
        values={"secret_notes": "No longer available"},
        created_by="admin",
        updated_by="admin",
    )

    db_session.add_all([draft_entry, review_entry, archived_entry])
    db_session.commit()

    # 1. Draft returns 404
    r1 = public_client.get(f"/api/content/entries/{draft_entry.id}")
    assert r1.status_code == 404

    # 2. In-Review returns 404
    r2 = public_client.get(f"/api/content/entries/{review_entry.id}")
    assert r2.status_code == 404

    # 3. Archived returns 404
    r3 = public_client.get(f"/api/content/entries/{archived_entry.id}")
    assert r3.status_code == 404
