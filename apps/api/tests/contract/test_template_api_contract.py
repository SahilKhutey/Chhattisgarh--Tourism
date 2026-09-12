import uuid
from app.modules.content_template.models import ContentTemplate


def test_template_api_contract_headers_and_shape(db_session, admin_client):
    tpl = ContentTemplate(
        id=uuid.uuid4(),
        name="Contract Template",
        slug="contract-template",
        status="DRAFT",
    )
    db_session.add(tpl)
    db_session.commit()

    # GET template by id
    res = admin_client.get(f"/api/templates/{tpl.id}")
    assert res.status_code == 200

    # Ensure X-Request-ID middleware header is present
    assert "x-request-id" in res.headers

    data = res.json()
    assert data["id"] == str(tpl.id)
    assert data["name"] == "Contract Template"
    assert data["slug"] == "contract-template"
    assert data["status"] == "DRAFT"
