import uuid
from sqlalchemy import select
from app.modules.content_entries.publish import publish_entry
from app.modules.content_entries.models import ContentEntry
from app.modules.content_template.models import ContentTemplate, TemplateVersion, TemplateVersionField
from app.modules.localization.models import Locale
from app.modules.search.models import SearchDocument


def test_search_document_sync_on_publish(db_session):
    loc = Locale(code="en", name="English", native_name="English", is_default=True, enabled=True)
    db_session.add(loc)

    tpl_id = uuid.uuid4()
    ver_id = uuid.uuid4()
    tpl = ContentTemplate(
        id=tpl_id,
        name="Search Template",
        slug="search-template",
        status="PUBLISHED",
    )
    db_session.add(tpl)

    ver = TemplateVersion(
        id=ver_id,
        template_id=tpl_id,
        version_number=1,
        name="Search v1",
        slug="search-v1",
        schema_hash="search-hash",
        created_by="admin",
    )
    db_session.add(ver)

    f1 = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=ver_id,
        key="name",
        label="Name",
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

    entry = ContentEntry(
        id=uuid.uuid4(),
        template_id=tpl_id,
        template_version_id=ver_id,
        slug="search-waterfall",
        title="Search Waterfall",
        status="DRAFT",
        values={"name": "Search Waterfall", "district": "Bastar"},
        locale_values={"en": {"name": "Search Waterfall"}},
        created_by="admin",
        updated_by="admin",
    )
    db_session.add(entry)
    db_session.commit()

    # Publish entry
    publish_entry(db_session, entry.id, actor_id="admin")
    db_session.commit()

    # Search document should be created for this entry
    docs = list(
        db_session.scalars(
            select(SearchDocument).where(SearchDocument.content_entry_id == entry.id)
        ).all()
    )
    assert len(docs) >= 1
    assert any(d.district == "Bastar" for d in docs)
    assert any("Search Waterfall" in d.title for d in docs)
