import uuid
import pytest
from app.modules.content_entries.domain.types import EntryValidationError
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_entries.services.relation_validator import RelationValidator


def test_missing_relation_rejected(db_session, destination_template):
    template, version = destination_template
    validator = RelationValidator()

    missing_id = str(uuid.uuid4())
    with pytest.raises(EntryValidationError) as exc:
        validator.validate(
            db_session,
            version,
            values={"nearby_destinations": [missing_id]},
        )
    assert f"related entry {missing_id} not found" in str(exc.value)


def test_valid_relation_accepted(db_session, destination_template, admin_user):
    template, version = destination_template
    validator = RelationValidator()

    # Create a related entry
    related = ContentEntry(
        id=uuid.uuid4(),
        template_id=template.id,
        template_version_id=version.id,
        slug="sirpur-heritage-site",
        title="Sirpur Heritage Site",
        status="PUBLISHED",
        values={"name": "Sirpur Heritage Site"},
        locale_values={},
        revision=1,
        created_by=str(admin_user.id),
        updated_by=str(admin_user.id),
    )
    db_session.add(related)
    db_session.commit()

    # Should not raise
    validator.validate(
        db_session,
        version,
        values={"nearby_destinations": [str(related.id)]},
    )
