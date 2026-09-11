from uuid import uuid4
import pytest
from httpx import AsyncClient

from app.modules.content_template.infrastructure.models import (
    ContentTemplateModel,
    TemplateFieldModel,
    TemplateGroupModel,
)
from app.modules.content_template.service import build_template_schema


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_create_template_success(client: AsyncClient):
    payload = {
        "name": "Tourist Destination",
        "slug": "tourist-destination",
        "description": "Template for tourist destinations",
        "category": "destination",
    }
    response = await client.post("/admin/templates", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["name"] == "Tourist Destination"
    assert data["slug"] == "tourist-destination"
    assert data["status"] == "DRAFT"
    assert data["revision"] == 1
    assert data["fields"] == []
    assert data["groups"] == []


@pytest.mark.asyncio
async def test_duplicate_slug_rejected(client: AsyncClient):
    payload = {
        "name": "Heritage Site",
        "slug": "heritage-site",
    }
    res1 = await client.post("/admin/templates", json=payload)
    assert res1.status_code == 201

    res2 = await client.post("/admin/templates", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"].lower()


@pytest.mark.asyncio
async def test_invalid_slug_rejected(client: AsyncClient):
    payload = {
        "name": "Invalid Site",
        "slug": "Invalid Slug",
    }
    response = await client.post("/admin/templates", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_template_success(client: AsyncClient):
    res_create = await client.post(
        "/admin/templates",
        json={"name": "Waterfalls", "slug": "waterfalls"},
    )
    template_id = res_create.json()["id"]

    res_get = await client.get(f"/admin/templates/{template_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == template_id
    assert res_get.json()["name"] == "Waterfalls"


@pytest.mark.asyncio
async def test_get_missing_template_returns_404(client: AsyncClient):
    random_id = str(uuid4())
    response = await client.get(f"/admin/templates/{random_id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_template_metadata(client: AsyncClient):
    res_create = await client.post(
        "/admin/templates",
        json={"name": "Initial Name", "slug": "initial-slug"},
    )
    template_id = res_create.json()["id"]

    update_payload = {
        "name": "Updated Name",
        "description": "Updated Description",
        "revision": 1,
    }
    res_update = await client.patch(f"/admin/templates/{template_id}", json=update_payload)
    assert res_update.status_code == 200
    assert res_update.json()["name"] == "Updated Name"
    assert res_update.json()["revision"] == 2


@pytest.mark.asyncio
async def test_revision_conflict_rejected(client: AsyncClient):
    res_create = await client.post(
        "/admin/templates",
        json={"name": "Concurrent Template", "slug": "concurrent-template"},
    )
    template_id = res_create.json()["id"]

    # First update succeeds, increments revision to 2
    res_update1 = await client.patch(
        f"/admin/templates/{template_id}",
        json={"name": "Update 1", "revision": 1},
    )
    assert res_update1.status_code == 200
    assert res_update1.json()["revision"] == 2

    # Second update using stale revision 1 must be rejected with 409
    res_update2 = await client.patch(
        f"/admin/templates/{template_id}",
        json={"name": "Update 2", "revision": 1},
    )
    assert res_update2.status_code == 409


@pytest.mark.asyncio
async def test_replace_fields_and_groups_success(client: AsyncClient):
    res_create = await client.post(
        "/admin/templates",
        json={"name": "Festival", "slug": "festival"},
    )
    template_id = res_create.json()["id"]

    fields_payload = {
        "revision": 1,
        "groups": [
            {"label": "Overview", "order": 0},
            {"label": "Media", "order": 1},
        ],
        "fields": [
            {
                "key": "title",
                "type": "TEXT",
                "label": "Festival Title",
                "required": True,
                "translatable": True,
                "order": 0,
                "config": {"maxLength": 100, "placeholder": "Festival Name"},
            },
            {
                "key": "banner",
                "type": "IMAGE",
                "label": "Banner Image",
                "required": False,
                "translatable": False,
                "order": 1,
                "config": {"requireAltText": True},
            },
        ],
    }

    res_fields = await client.put(f"/admin/templates/{template_id}/fields", json=fields_payload)
    assert res_fields.status_code == 200
    data = res_fields.json()
    assert data["revision"] == 2
    assert len(data["groups"]) == 2
    assert len(data["fields"]) == 2
    assert data["fields"][0]["key"] == "title"
    assert data["fields"][1]["key"] == "banner"


@pytest.mark.asyncio
async def test_duplicate_field_key_rejected(client: AsyncClient):
    res_create = await client.post(
        "/admin/templates",
        json={"name": "Crafts", "slug": "crafts"},
    )
    template_id = res_create.json()["id"]

    payload = {
        "revision": 1,
        "groups": [],
        "fields": [
            {"key": "craft_name", "type": "TEXT", "label": "Name 1", "order": 0},
            {"key": "craft_name", "type": "TEXT", "label": "Name 2", "order": 1},
        ],
    }
    response = await client.put(f"/admin/templates/{template_id}/fields", json=payload)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_invalid_field_type_rejected(client: AsyncClient):
    res_create = await client.post(
        "/admin/templates",
        json={"name": "Wildlife", "slug": "wildlife"},
    )
    template_id = res_create.json()["id"]

    payload = {
        "revision": 1,
        "groups": [],
        "fields": [
            {"key": "animal", "type": "MAGIC_FIELD", "label": "Animal", "order": 0},
        ],
    }
    response = await client.put(f"/admin/templates/{template_id}/fields", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_invalid_configuration_rejected(client: AsyncClient):
    res_create = await client.post(
        "/admin/templates",
        json={"name": "Homestay", "slug": "homestay"},
    )
    template_id = res_create.json()["id"]

    payload = {
        "revision": 1,
        "groups": [],
        "fields": [
            {
                "key": "photo",
                "type": "IMAGE",
                "label": "Photo",
                "order": 0,
                "config": {"requireAltText": False},
            },
        ],
    }
    response = await client.put(f"/admin/templates/{template_id}/fields", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_templates(client: AsyncClient):
    await client.post(
        "/admin/templates",
        json={"name": "Bastar Palace", "slug": "bastar-palace", "category": "heritage"},
    )
    await client.post(
        "/admin/templates",
        json={"name": "Kanger Valley", "slug": "kanger-valley", "category": "nature"},
    )

    # List all
    res_all = await client.get("/admin/templates")
    assert res_all.status_code == 200
    assert len(res_all.json()["items"]) >= 2

    # Filter by category
    res_heritage = await client.get("/admin/templates?category=heritage")
    assert res_heritage.status_code == 200
    items = res_heritage.json()["items"]
    assert any(item["slug"] == "bastar-palace" for item in items)
    assert not any(item["slug"] == "kanger-valley" for item in items)

    # Search
    res_search = await client.get("/admin/templates?search=Kanger")
    assert res_search.status_code == 200
    search_items = res_search.json()["items"]
    assert any(item["slug"] == "kanger-valley" for item in search_items)


def test_schema_order_is_deterministic():
    template = ContentTemplateModel(
        id=uuid4(),
        name="Deterministic Template",
        slug="deterministic-template",
        status="DRAFT",
        revision=1,
    )

    f3 = TemplateFieldModel(
        id=uuid4(),
        template_id=template.id,
        key="third",
        type="TEXT",
        label="Third",
        display_order=2,
        config={},
    )
    f1 = TemplateFieldModel(
        id=uuid4(),
        template_id=template.id,
        key="first",
        type="TEXT",
        label="First",
        display_order=0,
        config={},
    )
    f2 = TemplateFieldModel(
        id=uuid4(),
        template_id=template.id,
        key="second",
        type="TEXT",
        label="Second",
        display_order=1,
        config={},
    )

    # Attach in unordered sequence
    template.fields = [f3, f1, f2]
    template.groups = []

    schema = build_template_schema(template)
    orders = [field["order"] for field in schema["fields"]]
    assert orders == [0, 1, 2]
    assert [f["key"] for f in schema["fields"]] == ["first", "second", "third"]


@pytest.mark.asyncio
async def test_security_sql_injection_defense(client: AsyncClient):
    # SQL injection attempt via search query
    injection_payload = "'; DROP TABLE content_templates; --"
    response = await client.get(f"/admin/templates?search={injection_payload}")
    assert response.status_code == 200
    assert "items" in response.json()
