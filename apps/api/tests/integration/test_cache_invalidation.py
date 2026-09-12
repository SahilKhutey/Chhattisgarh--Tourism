import uuid
from app.modules.content_entries.publish import publish_entry
from app.modules.content_entries.models import ContentEntry
from app.modules.content_template.models import ContentTemplate, TemplateVersion, TemplateVersionField
from app.modules.localization.models import Locale
from app.modules.public_content.cache import PublicContentCache


def test_cache_invalidation_on_publish(db_session, monkeypatch):
    invalidated_keys = []
    monkeypatch.setattr(
        PublicContentCache,
        "invalidate",
        lambda self, slug: invalidated_keys.append(slug),
    )

    loc = Locale(code="en", name="English", native_name="English", is_default=True, enabled=True)
    db_session.add(loc)

    tpl_id = uuid.uuid4()
    ver_id = uuid.uuid4()
    tpl = ContentTemplate(
        id=tpl_id,
        name="Cache Template",
        slug="cache-template",
        status="PUBLISHED",
    )
    db_session.add(tpl)

    ver = TemplateVersion(
        id=ver_id,
        template_id=tpl_id,
        version_number=1,
        name="Cache v1",
        slug="cache-v1",
        schema_hash="cache-hash",
        created_by="admin",
    )
    db_session.add(ver)

    f1 = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=ver_id,
        key="headline",
        label="Headline",
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
        slug="cache-target-slug",
        title="Cache Invalidation Test",
        status="DRAFT",
        values={"headline": "Fast Rendering"},
        created_by="admin",
        updated_by="admin",
    )
    db_session.add(entry)
    db_session.commit()

    # Publish triggers cache invalidation
    publish_entry(db_session, entry.id, actor_id="admin")
    assert "cache-target-slug" in invalidated_keys
