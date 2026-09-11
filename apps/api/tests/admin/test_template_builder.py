def test_get_template_for_builder(
    client,
    template,
):
    response = client.get(
        f"/api/admin/templates/{template.id}"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(template.id)
    assert "fields" in data
    assert data["name"] == "Test Destination"
    assert data["status"] == "DRAFT"


def test_update_template_fields(
    client,
    template,
):
    payload = {
        "fields": [
            {
                "key": "name",
                "label": "Name",
                "type": "TEXT",
                "required": True,
                "translatable": True,
                "order": 0,
                "group": "Basic Information",
                "helpText": None,
                "config": {},
            }
        ]
    }

    response = client.patch(
        f"/api/admin/templates/{template.id}/fields",
        json=payload,
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["fields"]) == 1
    assert data["fields"][0]["key"] == "name"
    assert data["fields"][0]["label"] == "Name"


def test_duplicate_field_keys_rejected(
    client,
    template,
):
    field = {
        "key": "name",
        "label": "Name",
        "type": "TEXT",
        "order": 0,
        "required": False,
        "translatable": True,
        "config": {},
    }
    payload = {
        "fields": [
            field,
            {
                **field,
                "order": 1,
            },
        ]
    }

    response = client.patch(
        f"/api/admin/templates/{template.id}/fields",
        json=payload,
    )
    assert response.status_code == 422


def test_invalid_field_key_rejected(
    client,
    template,
):
    payload = {
        "fields": [
            {
                "key": "invalid-key",
                "label": "Invalid",
                "type": "TEXT",
                "order": 0,
                "required": False,
                "translatable": True,
                "config": {},
            }
        ]
    }

    response = client.patch(
        f"/api/admin/templates/{template.id}/fields",
        json=payload,
    )
    assert response.status_code == 422


def test_image_requires_alt_text(
    client,
    template,
):
    payload = {
        "fields": [
            {
                "key": "hero_image",
                "label": "Hero Image",
                "type": "IMAGE",
                "order": 0,
                "required": True,
                "translatable": False,
                "config": {
                    "require_alt_text": False,
                },
            }
        ]
    }

    response = client.patch(
        f"/api/admin/templates/{template.id}/fields",
        json=payload,
    )
    assert response.status_code == 422


def test_dropdown_requires_options(
    client,
    template,
):
    payload = {
        "fields": [
            {
                "key": "category",
                "label": "Category",
                "type": "DROPDOWN",
                "order": 0,
                "required": True,
                "translatable": True,
                "config": {},
            }
        ]
    }

    response = client.patch(
        f"/api/admin/templates/{template.id}/fields",
        json=payload,
    )
    assert response.status_code == 422


def test_relation_requires_target(
    client,
    template,
):
    payload = {
        "fields": [
            {
                "key": "related",
                "label": "Related",
                "type": "RELATION",
                "order": 0,
                "required": False,
                "translatable": False,
                "config": {},
            }
        ]
    }

    response = client.patch(
        f"/api/admin/templates/{template.id}/fields",
        json=payload,
    )
    assert response.status_code == 422


def test_published_template_is_read_only(
    client,
    published_template,
):
    payload = {
        "fields": [],
    }

    response = client.patch(
        f"/api/admin/templates/{published_template.id}/fields",
        json=payload,
    )
    assert response.status_code == 409


def test_non_contiguous_order_rejected(
    client,
    template,
):
    payload = {
        "fields": [
            {
                "key": "name",
                "label": "Name",
                "type": "TEXT",
                "order": 2,
                "required": False,
                "translatable": True,
                "config": {},
            }
        ]
    }

    response = client.patch(
        f"/api/admin/templates/{template.id}/fields",
        json=payload,
    )
    assert response.status_code == 422


def test_update_draft_endpoint(
    client,
    template,
):
    payload = {
        "metadata": {
            "name": "Updated Destination Name",
            "slug": "updated-destination-slug",
            "description": "Updated description",
            "icon": "map",
            "category": "heritage",
        },
        "fields": [
            {
                "key": "title",
                "label": "Title",
                "type": "TEXT",
                "order": 0,
                "required": True,
                "translatable": True,
                "config": {},
            }
        ],
    }

    response = client.patch(
        f"/api/admin/templates/{template.id}/draft",
        json=payload,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Destination Name"
    assert data["slug"] == "updated-destination-slug"
    assert len(data["fields"]) == 1
    assert data["fields"][0]["key"] == "title"


def test_validate_and_publish_template(
    client,
    template,
):
    # Add valid fields first
    payload = {
        "fields": [
            {
                "key": "hero_image",
                "label": "Hero Image",
                "type": "IMAGE",
                "order": 0,
                "required": True,
                "translatable": False,
                "config": {
                    "require_alt_text": True,
                },
            }
        ]
    }
    client.patch(
        f"/api/admin/templates/{template.id}/fields",
        json=payload,
    )

    # Validate
    res_val = client.post(f"/api/admin/templates/{template.id}/validate")
    assert res_val.status_code == 200
    val_data = res_val.json()
    assert val_data["valid"] is True
    assert len(val_data["errors"]) == 0

    # Publish
    res_pub = client.post(f"/api/admin/templates/{template.id}/publish")
    assert res_pub.status_code == 200
    pub_data = res_pub.json()
    assert pub_data["status"] == "PUBLISHED"
