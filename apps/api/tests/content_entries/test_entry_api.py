import uuid
from app.modules.content_template.models import ContentTemplate


def test_create_entry_api(client, destination_template):
    template, version = destination_template

    response = client.post(
        f"/api/admin/content-entries/templates/{template.id}",
        json={
            "title": "Kanger Valley National Park",
            "values": {
                "name": "Kanger Valley National Park",
                "description": "Known for caves and biodiversity.",
                "entry_fee": 100,
                "is_active": True,
                "category": "wildlife",
            },
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Kanger Valley National Park"
    assert data["slug"] == "kanger-valley-national-park"
    assert data["template_id"] == str(template.id)
    assert data["template_version_id"] == str(version.id)
    assert data["status"] == "DRAFT"
    assert data["revision"] == 1


def test_create_entry_against_unpublished_template_rejected_409(client, db_session, admin_user):
    # Template with no published version
    unpub_template = ContentTemplate(
        id=uuid.uuid4(),
        name="Unpublished Template",
        slug="unpub",
        status="DRAFT",
        published_version_id=None,
        created_by=admin_user.id,
    )
    db_session.add(unpub_template)
    db_session.commit()

    response = client.post(
        f"/api/admin/content-entries/templates/{unpub_template.id}",
        json={"title": "Should Fail", "values": {}},
    )

    assert response.status_code == 409
    assert "no published version" in response.json()["detail"]["message"].lower()


def test_update_entry_optimistic_concurrency_409(client, destination_template):
    template, _ = destination_template

    # Create entry
    create_res = client.post(
        f"/api/admin/content-entries/templates/{template.id}",
        json={
            "title": "Initial Entry",
            "values": {"name": "Initial Entry"},
        },
    )
    assert create_res.status_code == 201
    entry_id = create_res.json()["id"]
    assert create_res.json()["revision"] == 1

    # Update with revision 1 -> revision 2
    update_res = client.patch(
        f"/api/admin/content-entries/{entry_id}",
        json={
            "revision": 1,
            "title": "Updated Once",
            "values": {"name": "Updated Once"},
        },
    )
    assert update_res.status_code == 200
    assert update_res.json()["revision"] == 2

    # Stale update with revision 1 -> 409
    stale_res = client.patch(
        f"/api/admin/content-entries/{entry_id}",
        json={
            "revision": 1,
            "title": "Stale update attempt",
        },
    )
    assert stale_res.status_code == 409
    assert stale_res.json()["detail"]["current_revision"] == 2


def test_list_entries_api(client, destination_template):
    template, _ = destination_template
    # Create an entry
    client.post(
        f"/api/admin/content-entries/templates/{template.id}",
        json={
            "title": "List Test Entry",
            "values": {"name": "List Test Entry"},
        },
    )

    response = client.get("/api/admin/content-entries")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


def test_public_content_rendering_api(client, destination_template):
    template, _ = destination_template

    # 1. Create entry
    create_res = client.post(
        f"/api/admin/content-entries/templates/{template.id}",
        json={
            "title": "Tirathgarh Waterfall",
            "values": {
                "name": "Tirathgarh Waterfall",
                "description": "Spectacular cascade in Bastar.",
                "entry_fee": 30,
                "is_active": True,
                "category": "waterfalls",
            },
        },
    )
    assert create_res.status_code == 201
    entry_id = create_res.json()["id"]

    # 2. Before publishing, public endpoint should return 404
    pre_pub = client.get("/api/content/destination/tirathgarh-waterfall")
    assert pre_pub.status_code == 404

    # 3. Publish
    pub_res = client.post(f"/api/admin/content-entries/{entry_id}/publish")
    assert pub_res.status_code == 200
    assert pub_res.json()["status"] == "PUBLISHED"

    # 4. Public endpoint returns normalized runtime contract
    pub_get = client.get("/api/content/destination/tirathgarh-waterfall")
    assert pub_get.status_code == 200
    content = pub_get.json()
    assert content["template"]["slug"] == "destination"
    assert content["entry"]["slug"] == "tirathgarh-waterfall"
    assert any(f["key"] == "name" and f["value"] == "Tirathgarh Waterfall" for f in content["fields"])
