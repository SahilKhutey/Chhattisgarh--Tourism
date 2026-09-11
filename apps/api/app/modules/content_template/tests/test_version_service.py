import uuid
import pytest
from app.modules.content_template.models import ContentTemplate, TemplateField
from app.modules.content_template.services.version_service import TemplateVersionService


@pytest.fixture
def version_service():
    return TemplateVersionService()


@pytest.fixture
def sample_template(db_session):
    t = ContentTemplate(
        id=uuid.uuid4(),
        name="Bastar Tribal Art",
        slug="bastar-tribal-art",
        description="Crafts and traditions of Bastar",
        icon="sparkles",
        category="art_craft",
        status="DRAFT",
    )
    db_session.add(t)
    db_session.flush()

    f1 = TemplateField(
        id=uuid.uuid4(),
        template_id=t.id,
        key="artisan_name",
        label="Artisan Name",
        field_type="TEXT",
        required=True,
        translatable=False,
        order=0,
        group_name="Profile",
        help_text="Name of the artisan",
        config={},
    )
    f2 = TemplateField(
        id=uuid.uuid4(),
        template_id=t.id,
        key="gallery",
        label="Art Gallery",
        field_type="GALLERY",
        required=False,
        translatable=False,
        order=1,
        group_name="Media",
        help_text="Photos of artifacts",
        config={"require_alt_text": True},
    )
    db_session.add_all([f1, f2])
    db_session.commit()
    db_session.refresh(t)
    return t


def test_version_numbers_are_sequential(db_session, sample_template, version_service):
    first = version_service.create_snapshot(db_session, sample_template, "user-1")
    second = version_service.create_snapshot(db_session, sample_template, "user-1")

    assert first.version_number == 1
    assert second.version_number == 2


def test_version_is_not_modified_by_draft_changes(db_session, sample_template, version_service):
    version = version_service.create_snapshot(db_session, sample_template, "user-1")
    original_hash = version.schema_hash
    original_name = version.name

    sample_template.name = "Changed Draft Name"
    sample_template.fields[0].label = "Modified Artisan Label"
    db_session.flush()

    assert version.schema_hash == original_hash
    assert version.name == original_name
    assert version.name != sample_template.name
    assert version.fields[0].label == "Artisan Name"


def test_same_schema_produces_same_hash(db_session, sample_template, version_service):
    first = version_service.create_snapshot(db_session, sample_template, "user-1")
    second = version_service.create_snapshot(db_session, sample_template, "user-1")

    assert first.schema_hash == second.schema_hash
