import uuid
from app.modules.content_entries.models import ContentEntry
from app.modules.content_template.models import ContentTemplate, TemplateVersion, TemplateVersionField
from app.modules.localization.models import Locale


def test_public_api_contract_response_shape(db_session, public_client):
    loc = Locale(code="en", name="English", native_name="English", is_default=True, enabled=True)
    db_session.add(loc)

    tpl_id = uuid.uuid4()
    ver_id = uuid.uuid4()
    tpl = ContentTemplate(
        id=tpl_id,
        name="Public Contract Template",
        slug="public-contract-template",
        status="PUBLISHED",
    )
    db_session.add(tpl)

    ver = TemplateVersion(
        id=ver_id,
        template_id=tpl_id,
        version_number=1,
        name="Contract v1",
        slug="contract-v1",
        schema_hash="contract-hash",
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
        slug="public-contract-entry",
        title="Public Contract Test",
        status="PUBLISHED",
        values={"headline": "Public Destination Header"},
        created_by="admin",
        updated_by="admin",
    )
    db_session.add(entry)
    db_session.commit()

    res = public_client.get(f"/api/content/entries/{entry.id}")
    assert res.status_code == 200

    # Ensure X-Request-ID header
    assert "x-request-id" in res.headers

    data = res.json()
    assert "template" in data
    assert "entry" in data
    assert "fields" in data
    assert data["entry"]["id"] == str(entry.id)
    assert data["entry"]["slug"] == "public-contract-entry"
    assert data["entry"]["title"] == "Public Contract Test"
