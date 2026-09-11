import uuid
from app.modules.content_template.models import ContentTemplate, TemplateField


def test_empty_dashboard(client):
    response = client.get("/api/admin/templates")
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0
    assert data["page"] == 1
    assert data["page_size"] == 20
    assert data["total_pages"] == 0
    assert data["draft_count"] == 0
    assert data["published_count"] == 0
    assert data["archived_count"] == 0


def test_dashboard_counts_and_items(client, db_session):
    # Template 1: DRAFT with 2 fields
    t1 = ContentTemplate(
        id=uuid.uuid4(),
        name="Temple Heritage",
        slug="temple-heritage",
        status="DRAFT",
        category="heritage",
    )
    db_session.add(t1)
    db_session.flush()

    f1 = TemplateField(
        id=uuid.uuid4(),
        template_id=t1.id,
        key="history",
        label="History",
        field_type="TEXT_LONG",
        order=0,
    )
    f2 = TemplateField(
        id=uuid.uuid4(),
        template_id=t1.id,
        key="location",
        label="Location",
        field_type="GEO_POINT",
        order=1,
    )
    db_session.add_all([f1, f2])

    # Template 2: PUBLISHED with 1 field
    t2 = ContentTemplate(
        id=uuid.uuid4(),
        name="Waterfalls of Bastar",
        slug="waterfalls-bastar",
        status="PUBLISHED",
        category="nature",
    )
    db_session.add(t2)
    db_session.flush()

    f3 = TemplateField(
        id=uuid.uuid4(),
        template_id=t2.id,
        key="height",
        label="Height",
        field_type="NUMBER",
        order=0,
    )
    db_session.add(f3)

    # Template 3: ARCHIVED with 0 fields
    t3 = ContentTemplate(
        id=uuid.uuid4(),
        name="Old Craft Route",
        slug="old-craft-route",
        status="ARCHIVED",
        category="craft",
    )
    db_session.add(t3)
    db_session.commit()

    response = client.get("/api/admin/templates")
    assert response.status_code == 200
    data = response.json()

    assert data["total"] == 3
    assert data["draft_count"] == 1
    assert data["published_count"] == 1
    assert data["archived_count"] == 1
    assert len(data["items"]) == 3

    items_by_slug = {it["slug"]: it for it in data["items"]}
    assert items_by_slug["temple-heritage"]["field_count"] == 2
    assert items_by_slug["waterfalls-bastar"]["field_count"] == 1
    assert items_by_slug["old-craft-route"]["field_count"] == 0


def test_dashboard_status_filter(client, db_session):
    t1 = ContentTemplate(id=uuid.uuid4(), name="T1", slug="t1", status="DRAFT")
    t2 = ContentTemplate(id=uuid.uuid4(), name="T2", slug="t2", status="PUBLISHED")
    db_session.add_all([t1, t2])
    db_session.commit()

    # Filter DRAFT
    res = client.get("/api/admin/templates?status=DRAFT")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert data["items"][0]["slug"] == "t1"
    assert data["draft_count"] == 1
    assert data["published_count"] == 1

    # Filter PUBLISHED
    res = client.get("/api/admin/templates?status=PUBLISHED")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert data["items"][0]["slug"] == "t2"


def test_dashboard_search_and_category_filter(client, db_session):
    t1 = ContentTemplate(
        id=uuid.uuid4(),
        name="Chitrakote Falls",
        slug="chitrakote-falls",
        status="PUBLISHED",
        category="nature",
        description="Niagara of India",
    )
    t2 = ContentTemplate(
        id=uuid.uuid4(),
        name="Sirpur Monuments",
        slug="sirpur-monuments",
        status="PUBLISHED",
        category="heritage",
        description="Buddhist excavation sites",
    )
    db_session.add_all([t1, t2])
    db_session.commit()

    # Search by keyword
    res = client.get("/api/admin/templates?search=Niagara")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert data["items"][0]["slug"] == "chitrakote-falls"

    # Filter by category
    res = client.get("/api/admin/templates?category=heritage")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert data["items"][0]["slug"] == "sirpur-monuments"


def test_dashboard_pagination(client, db_session):
    for i in range(5):
        t = ContentTemplate(
            id=uuid.uuid4(),
            name=f"Template {i}",
            slug=f"template-{i}",
            status="DRAFT",
        )
        db_session.add(t)
    db_session.commit()

    # Page 1, page_size 2
    res = client.get("/api/admin/templates?page=1&page_size=2")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 5
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert data["total_pages"] == 3
    assert len(data["items"]) == 2

    # Page 3, page_size 2
    res = client.get("/api/admin/templates?page=3&page_size=2")
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) == 1


def test_dashboard_pagination_validation(client):
    # Invalid page (< 1)
    res = client.get("/api/admin/templates?page=0")
    assert res.status_code == 422

    # Invalid page_size (> 100)
    res = client.get("/api/admin/templates?page_size=101")
    assert res.status_code == 422
