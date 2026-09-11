import uuid
from app.modules.accessibility.service import AccessibilityService
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_template.models.template import ContentTemplate
from app.modules.content_template.models.template_version import (
    TemplateVersion,
    TemplateVersionField,
)


def test_persist_audit_records_in_db(db_session):
    service = AccessibilityService()

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
        key="hero",
        label="Hero Image",
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
        slug="entry-1",
        title="Title",
        status="DRAFT",
        values={"hero": {"url": "test.jpg"}},  # missing alt
        revision=1,
        created_by="admin",
        updated_by="admin",
    )
    db_session.add(entry)
    db_session.commit()

    result = service.audit_entry(
        db=db_session,
        entry=entry,
        template=version,
        locale_code="en",
        persist=True,
    )

    assert result["status"] == "FAIL"
    assert result["score"] == 80

    summary = service.get_audit_summary(db_session)
    assert summary["total"] == 1
    assert summary["blockers"] == 1
    assert summary["average_score"] == 80.0

    entry_audit = service.get_entry_audit(db_session, entry.id)
    assert entry_audit is not None
    assert entry_audit.score == 80
    assert len(entry_audit.issues) == 1
