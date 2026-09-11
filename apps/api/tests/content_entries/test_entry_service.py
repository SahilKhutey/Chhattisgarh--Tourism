import uuid
import pytest
from app.modules.content_entries.domain.types import EntryConflictError
from app.modules.content_entries.schemas.entries import (
    ContentEntryCreate,
    ContentEntryUpdate,
)
from app.modules.content_entries.services.entry_service import ContentEntryService


def test_create_entry_binds_exact_version(db_session, destination_template, admin_user):
    template, version = destination_template
    service = ContentEntryService()

    payload = ContentEntryCreate(
        title="Barnawapara Sanctuary",
        values={"name": "Barnawapara Sanctuary", "entry_fee": 50},
    )

    entry = service.create(
        db=db_session,
        template=template,
        version=version,
        payload=payload,
        user_id=admin_user.id,
    )
    db_session.commit()

    assert entry.template_id == template.id
    assert entry.template_version_id == version.id
    assert entry.status == "DRAFT"
    assert entry.revision == 1
    assert entry.slug == "barnawapara-sanctuary"


def test_slug_generation_and_deduplication(db_session, destination_template, admin_user):
    template, version = destination_template
    service = ContentEntryService()

    # Entry 1
    entry1 = service.create(
        db=db_session,
        template=template,
        version=version,
        payload=ContentEntryCreate(
            title="Chitrakote Falls",
            values={"name": "Chitrakote Falls"},
        ),
        user_id=admin_user.id,
    )
    db_session.commit()
    assert entry1.slug == "chitrakote-falls"

    # Entry 2 with identical title -> deduplicated to -2
    entry2 = service.create(
        db=db_session,
        template=template,
        version=version,
        payload=ContentEntryCreate(
            title="Chitrakote Falls",
            values={"name": "Chitrakote Falls"},
        ),
        user_id=admin_user.id,
    )
    db_session.commit()
    assert entry2.slug == "chitrakote-falls-2"


def test_update_entry_optimistic_concurrency(db_session, destination_template, admin_user):
    template, version = destination_template
    service = ContentEntryService()

    entry = service.create(
        db=db_session,
        template=template,
        version=version,
        payload=ContentEntryCreate(
            title="Mainpat Hill Station",
            values={"name": "Mainpat"},
        ),
        user_id=admin_user.id,
    )
    db_session.commit()
    assert entry.revision == 1

    # Valid update with revision 1 -> becomes 2
    updated = service.update(
        db=db_session,
        entry_id=entry.id,
        payload=ContentEntryUpdate(
            title="Mainpat Plateau",
            values={"name": "Mainpat Plateau"},
            revision=1,
        ),
        user_id=admin_user.id,
    )
    db_session.commit()
    assert updated.revision == 2
    assert updated.title == "Mainpat Plateau"

    # Stale update with revision 1 -> rejected with EntryConflictError
    with pytest.raises(EntryConflictError) as exc:
        service.update(
            db=db_session,
            entry_id=entry.id,
            payload=ContentEntryUpdate(
                title="Stale Overwrite",
                revision=1,
            ),
            user_id=admin_user.id,
        )
    assert exc.value.current_revision == 2
