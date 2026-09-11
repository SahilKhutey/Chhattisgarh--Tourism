import uuid
from sqlalchemy import event
from app.modules.content_template.models import ContentTemplate


def test_runtime_schema_success(client, destination_template):
    template, version = destination_template

    res = client.get(f"/api/admin/templates/{template.id}/runtime-schema")
    assert res.status_code == 200
    data = res.json()
    assert data["template"]["id"] == str(template.id)
    assert data["template"]["slug"] == "destination"
    assert data["template"]["version"] == 1
    assert len(data["fields"]) == 9
    assert data["fields"][0]["key"] == "name"
    assert data["fields"][0]["required"] is True


def test_runtime_schema_unpublished_template_404(client, db_session, admin_user):
    unpub = ContentTemplate(
        id=uuid.uuid4(),
        name="Unpublished",
        slug="unpub",
        status="DRAFT",
        published_version_id=None,
        created_by=admin_user.id,
    )
    db_session.add(unpub)
    db_session.commit()

    res = client.get(f"/api/admin/templates/{unpub.id}/runtime-schema")
    assert res.status_code == 404
    assert "no published version" in res.json()["detail"].lower()


def test_runtime_schema_query_count_prevents_n_plus_one(client, destination_template, db_session):
    template, _ = destination_template

    queries = []

    def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        queries.append(statement)

    engine = db_session.get_bind()
    event.listen(engine, "before_cursor_execute", before_cursor_execute)

    try:
        res = client.get(f"/api/admin/templates/{template.id}/runtime-schema")
        assert res.status_code == 200
        # Expected queries:
        # 1. Select template
        # 2. Select version with joined/selectinload fields
        # Not 1 + N fields queries
        assert len(queries) <= 3
    finally:
        event.remove(engine, "before_cursor_execute", before_cursor_execute)
