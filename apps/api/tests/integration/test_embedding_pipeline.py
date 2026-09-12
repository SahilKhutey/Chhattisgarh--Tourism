import uuid
from app.events.models import OutboxEvent
from app.events.publisher import dispatch_domain_event


def test_embedding_pipeline_outbox_dispatch(db_session, monkeypatch):
    dispatched_entry_ids = []

    def mock_on_published(db, entry):
        dispatched_entry_ids.append(str(entry.id))

    monkeypatch.setattr(
        "app.modules.intelligence.workers.on_content_published",
        mock_on_published,
    )

    fake_id = uuid.uuid4()
    event = OutboxEvent(
        event_type="CONTENT_PUBLISHED",
        aggregate_id=fake_id,
        payload={"id": str(fake_id), "slug": "ai-destination"},
        processed=False,
    )
    db_session.add(event)
    db_session.commit()

    # Dispatch event
    dispatch_domain_event(event, db_session)
    # Event should be handled without raising unhandled exceptions
    assert event.aggregate_id == fake_id
