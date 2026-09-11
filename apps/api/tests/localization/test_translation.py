import uuid
import pytest
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_template.models.template import ContentTemplate
from app.modules.content_template.models.template_version import (
    TemplateVersion,
    TemplateVersionField,
)
from app.modules.localization.seed import seed_locales
from app.modules.localization.service import (
    FieldNotTranslatableError,
    LocalizationService,
)


def test_upsert_template_localization(db_session):
    seed_locales(db_session)
    service = LocalizationService()

    template = ContentTemplate(
        id=uuid.uuid4(),
        name="Destination",
        slug="destination",
        status="DRAFT",
    )
    db_session.add(template)
    db_session.commit()

    loc = service.upsert_template_localization(
        db=db_session,
        template_id=template.id,
        locale_code="hi",
        name="पर्यटन स्थल",
        description="विवरण",
    )

    assert loc.name == "पर्यटन स्थल"
    assert loc.locale_code == "hi"

    # Update
    loc_updated = service.upsert_template_localization(
        db=db_session,
        template_id=template.id,
        locale_code="hi",
        name="पर्यटन स्थल - अद्यतन",
        description="नया विवरण",
    )
    assert loc_updated.id == loc.id
    assert loc_updated.name == "पर्यटन स्थल - अद्यतन"


def test_upsert_unsupported_locale_raises(db_session):
    seed_locales(db_session)
    service = LocalizationService()

    template = ContentTemplate(
        id=uuid.uuid4(),
        name="Destination",
        slug="destination-2",
        status="DRAFT",
    )
    db_session.add(template)
    db_session.commit()

    with pytest.raises(ValueError) as exc:
        service.upsert_template_localization(
            db=db_session,
            template_id=template.id,
            locale_code="fr",
            name="Destination",
            description=None,
        )
    assert "Unsupported locale" in str(exc.value)


def test_non_translatable_field_rejected(db_session):
    seed_locales(db_session)
    service = LocalizationService()

    template_id = uuid.uuid4()
    version_id = uuid.uuid4()

    version = TemplateVersion(
        id=version_id,
        template_id=template_id,
        version_number=1,
        name="Destination",
        slug="dest",
        schema_hash="hash",
        created_by="admin",
    )
    db_session.add(version)

    field = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=version_id,
        key="location",
        label="Location Coordinates",
        type="GEO_POINT",
        required=True,
        translatable=False,
        order=1,
    )
    db_session.add(field)

    entry = ContentEntry(
        id=uuid.uuid4(),
        template_id=template_id,
        template_version_id=version_id,
        slug="dest-1",
        title="Bastar",
        status="DRAFT",
        values={"location": {"latitude": 19.0, "longitude": 81.0}},
        revision=1,
        created_by="admin",
        updated_by="admin",
    )
    db_session.add(entry)
    db_session.commit()

    with pytest.raises(FieldNotTranslatableError) as exc:
        service.update_content_field_translation(
            db=db_session,
            entry_id=entry.id,
            field_key="location",
            locale_code="hi",
            value="बस्तर",
        )
    assert exc.value.field_key == "location"


def test_translatable_field_translation_success(db_session):
    seed_locales(db_session)
    service = LocalizationService()

    template_id = uuid.uuid4()
    version_id = uuid.uuid4()

    template = ContentTemplate(
        id=template_id,
        name="Destination",
        slug="destination",
        status="DRAFT",
    )
    db_session.add(template)

    version = TemplateVersion(
        id=version_id,
        template_id=template_id,
        version_number=1,
        name="Destination",
        slug="dest",
        schema_hash="hash",
        created_by="admin",
    )
    db_session.add(version)

    field = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=version_id,
        key="title",
        label="Title",
        type="TEXT",
        required=True,
        translatable=True,
        order=1,
    )
    db_session.add(field)

    entry = ContentEntry(
        id=uuid.uuid4(),
        template_id=template_id,
        template_version_id=version_id,
        slug="dest-1",
        title="Bastar",
        status="DRAFT",
        values={"title": "Bastar"},
        revision=1,
        created_by="admin",
        updated_by="admin",
    )
    db_session.add(entry)
    db_session.commit()

    loc = service.update_content_field_translation(
        db=db_session,
        entry_id=entry.id,
        field_key="title",
        locale_code="hi",
        value="बस्तर",
    )
    assert loc.value == "बस्तर"
    assert loc.field_key == "title"
    assert entry.locale_values.get("hi", {}).get("title") == "बस्तर"

    # Test get_template_localization and get_template_completeness
    t_loc = service.get_template_localization(db_session, template_id, "hi")
    t_locs = service.get_template_localizations(db_session, template_id)
    assert isinstance(t_locs, list)
    t_comp = service.get_template_completeness(db_session, template_id, "hi")
    assert "percentage" in t_comp

    # Test get_content_localizations and get_content_completeness
    c_locs = service.get_content_localizations(db_session, entry.id)
    assert len(c_locs) == 1
    c_comp = service.get_content_completeness(db_session, entry.id, "hi")
    assert c_comp["complete"] is True
    assert c_comp["percentage"] == 100.0
