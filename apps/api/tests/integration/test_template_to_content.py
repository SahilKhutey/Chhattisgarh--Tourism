import uuid
import pytest
from sqlalchemy import select
from app.events.models import OutboxEvent
from app.jobs.outbox import process_outbox_once
from app.modules.content_entries.models import ContentEntry
from app.modules.content_template.models import ContentTemplate, TemplateVersion, TemplateVersionField
from app.modules.localization.models import Locale
from app.modules.search.models import SearchDocument


def test_complete_template_to_content_golden_path(
    db_session,
    admin_client,
    creator_client,
    moderator_client,
    public_client,
):
    # 0. Setup default locale
    loc = Locale(code="en", name="English", native_name="English", is_default=True, enabled=True)
    db_session.add(loc)
    db_session.commit()

    # 1. Admin creates a template
    tpl_id = uuid.uuid4()
    ver_id = uuid.uuid4()
    tpl = ContentTemplate(
        id=tpl_id,
        name="Destination P13",
        slug="destination-p13",
        description="Destination Template for P13 Golden Path",
        icon="map-pin",
        category="destinations",
        status="PUBLISHED",
    )
    db_session.add(tpl)

    ver = TemplateVersion(
        id=ver_id,
        template_id=tpl_id,
        version_number=1,
        name="Destination P13 v1",
        slug="destination-p13-v1",
        schema_hash="hash-p13-test",
        created_by="admin",
    )
    db_session.add(ver)

    f1 = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=ver_id,
        key="name",
        label="Destination Name",
        type="TEXT",
        required=True,
        translatable=True,
        order=1,
    )
    f2 = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=ver_id,
        key="district",
        label="District",
        type="TEXT",
        required=True,
        translatable=False,
        order=2,
    )
    db_session.add_all([f1, f2])
    tpl.published_version_id = ver.id
    db_session.commit()

    # 2. Creator creates draft content entry
    create_res = creator_client.post(
        f"/api/admin/content-entries/templates/{tpl.id}",
        json={
            "title": "Chitrakote Falls P13",
            "slug": "chitrakote-falls-p13",
            "values": {
                "name": "Chitrakote Falls",
                "district": "Bastar",
            },
            "locale_values": {
                "en": {
                    "name": "Chitrakote Falls",
                },
            },
        },
    )
    assert create_res.status_code == 201
    entry_id = create_res.json()["id"]
    assert create_res.json()["status"] == "DRAFT"

    # 3. Creator submits entry for review
    submit_res = creator_client.post(f"/api/admin/content-entries/{entry_id}/submit-review")
    assert submit_res.status_code == 200
    assert submit_res.json()["status"] == "IN_REVIEW"

    # 4. Public client attempts to access in-review entry -> 404
    pub_get_unpub = public_client.get(f"/api/content/entries/{entry_id}")
    assert pub_get_unpub.status_code == 404

    # 5. Moderator publishes the entry
    publish_res = moderator_client.post(f"/api/admin/content-entries/{entry_id}/publish")
    assert publish_res.status_code == 200
    assert publish_res.json()["status"] == "PUBLISHED"
    assert publish_res.json()["published_at"] is not None

    # 6. Verify OutboxEvent was recorded transactionally
    events = list(db_session.scalars(select(OutboxEvent)).all())
    assert len(events) >= 1
    published_event = next(e for e in events if e.event_type == "CONTENT_PUBLISHED")
    assert str(published_event.aggregate_id) == str(entry_id)
    assert published_event.processed is False

    # 7. Worker processes outbox
    processed = process_outbox_once(db_session)
    assert processed >= 1
    db_session.refresh(published_event)
    assert published_event.processed is True
    assert published_event.processed_at is not None

    # 8. Public client accesses published content
    pub_get_pub = public_client.get(f"/api/content/entries/{entry_id}")
    assert pub_get_pub.status_code == 200
    pub_data = pub_get_pub.json()
    assert "entry" in pub_data
    assert pub_data["entry"]["title"] == "Chitrakote Falls P13"
    assert pub_data["entry"]["slug"] == "chitrakote-falls-p13"
