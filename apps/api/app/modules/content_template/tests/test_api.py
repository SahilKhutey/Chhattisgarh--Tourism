import uuid


def test_create_template(client):
    response = client.post(
        "/api/templates",
        json={
            "name": "Tourist Destination",
            "slug": "tourist-destination",
            "description": "Tourism destination template",
            "category": "destination",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["slug"] == "tourist-destination"
    assert data["status"] == "DRAFT"
    assert "id" in data


def test_duplicate_slug(client):
    payload = {
        "name": "Tourist Destination",
        "slug": "duplicate-template",
        "category": "destination",
    }

    first = client.post(
        "/api/templates",
        json=payload,
    )
    assert first.status_code == 201

    second = client.post(
        "/api/templates",
        json=payload,
    )
    assert second.status_code == 409


def test_get_template(client):
    created = client.post(
        "/api/templates",
        json={
            "name": "Get Destination",
            "slug": "get-destination",
        },
    ).json()

    response = client.get(f"/api/templates/{created['id']}")
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_nonexistent_template(client):
    fake_id = str(uuid.uuid4())
    response = client.get(f"/api/templates/{fake_id}")
    assert response.status_code == 404


def test_add_template_fields(client):
    response = client.post(
        "/api/templates",
        json={
            "name": "Tourist Place",
            "slug": "tourist-place",
        },
    )

    assert response.status_code == 201

    template_id = response.json()["id"]

    response = client.patch(
        f"/api/templates/{template_id}/fields",
        json={
            "upsert": [
                {
                    "key": "name",
                    "label": "Name",
                    "field_type": "TEXT",
                    "required": True,
                    "translatable": True,
                    "order": 0,
                    "config": {},
                },
                {
                    "key": "description",
                    "label": "Description",
                    "field_type": "TEXTAREA",
                    "required": False,
                    "translatable": True,
                    "order": 1,
                    "config": {},
                },
            ],
            "delete_keys": [],
            "ordered_keys": [
                "name",
                "description",
            ],
        },
    )

    assert response.status_code == 200

    fields = response.json()["fields"]

    assert len(fields) == 2
    assert fields[0]["key"] == "name"


def test_publish_template(client):
    response = client.post(
        "/api/templates",
        json={
            "name": "Published Destination",
            "slug": "published-destination",
        },
    )

    template_id = response.json()["id"]

    client.patch(
        f"/api/templates/{template_id}/fields",
        json={
            "upsert": [
                {
                    "key": "name",
                    "label": "Name",
                    "field_type": "TEXT",
                    "required": True,
                    "translatable": True,
                    "order": 0,
                    "config": {},
                }
            ],
            "delete_keys": [],
            "ordered_keys": ["name"],
        },
    )

    response = client.post(
        f"/api/templates/{template_id}/publish"
    )

    assert response.status_code == 200
    assert response.json()["status"] == "PUBLISHED"


def test_empty_template_cannot_publish(client):
    response = client.post(
        "/api/templates",
        json={
            "name": "Empty Template",
            "slug": "empty-template",
        },
    )

    template_id = response.json()["id"]

    response = client.post(
        f"/api/templates/{template_id}/publish"
    )

    assert response.status_code == 422


def test_published_template_cannot_change_fields(client):
    response = client.post(
        "/api/templates",
        json={
            "name": "Immutable Template",
            "slug": "immutable-template",
        },
    )

    template_id = response.json()["id"]

    client.patch(
        f"/api/templates/{template_id}/fields",
        json={
            "upsert": [
                {
                    "key": "name",
                    "label": "Name",
                    "field_type": "TEXT",
                    "required": True,
                    "translatable": True,
                    "order": 0,
                    "config": {},
                }
            ],
            "delete_keys": [],
            "ordered_keys": ["name"],
        },
    )

    client.post(
        f"/api/templates/{template_id}/publish"
    )

    response = client.patch(
        f"/api/templates/{template_id}/fields",
        json={
            "upsert": [
                {
                    "key": "new_field",
                    "label": "New",
                    "field_type": "TEXT",
                    "required": False,
                    "translatable": True,
                    "order": 1,
                    "config": {},
                }
            ],
            "delete_keys": [],
            "ordered_keys": [
                "name",
                "new_field",
            ],
        },
    )

    assert response.status_code == 409


def test_invalid_field_patch_fails(client):
    response = client.post(
        "/api/templates",
        json={
            "name": "Invalid Field Template",
            "slug": "invalid-field-template",
        },
    )
    template_id = response.json()["id"]

    response = client.patch(
        f"/api/templates/{template_id}/fields",
        json={
            "upsert": [
                {
                    "key": "bad_image",
                    "label": "Bad Image",
                    "field_type": "IMAGE",
                    "required": False,
                    "translatable": True,
                    "order": 0,
                    "config": {
                        "requireAltText": False,
                    },
                }
            ],
            "delete_keys": [],
            "ordered_keys": ["bad_image"],
        },
    )
    assert response.status_code == 422


def test_duplicate_field_keys_patch_fails(client):
    response = client.post(
        "/api/templates",
        json={
            "name": "Duplicate Key Template",
            "slug": "duplicate-key-template",
        },
    )
    template_id = response.json()["id"]

    response = client.patch(
        f"/api/templates/{template_id}/fields",
        json={
            "upsert": [
                {
                    "key": "title",
                    "label": "Title 1",
                    "field_type": "TEXT",
                    "required": True,
                    "translatable": True,
                    "order": 0,
                    "config": {},
                },
                {
                    "key": "title",
                    "label": "Title 2",
                    "field_type": "TEXT",
                    "required": True,
                    "translatable": True,
                    "order": 1,
                    "config": {},
                },
            ],
            "delete_keys": [],
            "ordered_keys": ["title"],
        },
    )
    assert response.status_code == 422


def test_transaction_rollback_on_failure(client):
    response = client.post(
        "/api/templates",
        json={
            "name": "Atomic Rollback Template",
            "slug": "atomic-rollback-template",
        },
    )
    template_id = response.json()["id"]

    # Send batch with valid field + invalid field (bad image requiring alt text false)
    response = client.patch(
        f"/api/templates/{template_id}/fields",
        json={
            "upsert": [
                {
                    "key": "valid_field",
                    "label": "Valid Field",
                    "field_type": "TEXT",
                    "required": True,
                    "translatable": True,
                    "order": 0,
                    "config": {},
                },
                {
                    "key": "invalid_image",
                    "label": "Invalid Image",
                    "field_type": "IMAGE",
                    "required": False,
                    "translatable": False,
                    "order": 1,
                    "config": {
                        "requireAltText": False,
                    },
                },
            ],
            "delete_keys": [],
            "ordered_keys": ["valid_field", "invalid_image"],
        },
    )
    assert response.status_code == 422

    # Verify that valid_field was NOT persisted
    get_res = client.get(f"/api/templates/{template_id}")
    assert get_res.status_code == 200
    assert len(get_res.json()["fields"]) == 0


def test_get_compiled_schema(client):
    response = client.post(
        "/api/templates",
        json={
            "name": "Compiled Template",
            "slug": "compiled-template",
            "category": "heritage",
        },
    )
    template_id = response.json()["id"]

    client.patch(
        f"/api/templates/{template_id}/fields",
        json={
            "upsert": [
                {
                    "key": "title",
                    "label": "Title",
                    "field_type": "TEXT",
                    "required": True,
                    "translatable": True,
                    "order": 0,
                    "config": {},
                }
            ],
            "delete_keys": [],
            "ordered_keys": ["title"],
        },
    )

    schema_res = client.get(f"/api/templates/{template_id}/compiled-schema")
    assert schema_res.status_code == 200
    data = schema_res.json()
    assert "template" in data
    assert "fields" in data
    assert data["template"]["slug"] == "compiled-template"
    assert len(data["fields"]) == 1
    assert data["fields"][0]["key"] == "title"
