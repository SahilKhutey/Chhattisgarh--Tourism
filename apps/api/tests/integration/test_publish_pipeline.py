import uuid
import pytest
from sqlalchemy import select
from app.events.models import OutboxEvent
from app.jobs.outbox import process_outbox_once
from app.modules.content_entries.publish import publish_entry
from app.modules.content_entries.models import ContentEntry
from app.modules.content_template.models import ContentTemplate, TemplateVersion, TemplateVersionField
from app.modules.localization.models import Locale


def test_publish_pipeline_outbox_and_worker(db_session):
    loc = Locale(code="en", name="English", native_name="English", is_default=True, enabled=True)
    db_session.add(loc)

    tpl_id = uuid.uuid4()
    ver_id = uuid.uuid4()
    tpl = ContentTemplate(
        id=tpl_id,
        name="Pipeline Template",
        slug="pipeline-template",
        status="PUBLISHED",
    )
    db_session.add(tpl)

    ver = TemplateVersion(
        id=ver_id,
        template_id=tpl_id,
        version_number=1,
        name="Pipeline v1",
        slug="pipeline-v1",
        schema_hash="pipeline-hash",
        created_by="admin",
    )
    db_session.add(ver)

    f1 = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=ver_id,
        key="title_text",
        label="Title",
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
        slug="pipeline-entry-1",
        title="Pipeline Entry",
        status="DRAFT",
        values={"title_text": "Durable Event Verification"},
        created_by="admin",
        updated_by="admin",
    )
    db_session.add(entry)
    db_session.commit()

    # Publish entry
    published = publish_entry(db_session, entry.id, actor_id="moderator-1")
    assert published.status == "PUBLISHED"
    db_session.commit()

    # Verify OutboxEvent recorded
    outbox_events = list(
        db_session.scalars(
            select(OutboxEvent).where(OutboxEvent.aggregate_id == entry.id)
        ).all()
    )
    assert len(outbox_events) == 1
    event = outbox_events[0]
    assert event.event_type == "CONTENT_PUBLISHED"
    assert event.processed is False

    # Process outbox
    processed_count = process_outbox_once(db_session)
    assert processed_count >= 1
    db_session.refresh(event)
    assert event.processed is True
    assert event.processed_at is not None
