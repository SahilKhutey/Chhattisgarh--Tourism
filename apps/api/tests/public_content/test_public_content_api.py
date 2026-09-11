from __future__ import annotations


def test_published_content_is_public(client, published_entry):
    response = client.get(f"/api/content/{published_entry.slug}")
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == str(published_entry.id)
    assert data["slug"] == published_entry.slug
    assert data["locale"] == "en"
    assert data["name"] == "Barnawapara Sanctuary"
    assert data["template_version"] == 1
    assert "fields" in data
    assert len(data["fields"]) > 0

    # Verify canonical URL and breadcrumbs
    assert f"/en/destinations/{published_entry.slug}" in data["canonical_url"]
    assert len(data["breadcrumbs"]) == 3
    assert data["breadcrumbs"][0]["label"] == "Home"
    assert data["breadcrumbs"][1]["label"] == "Destinations"
    assert data["breadcrumbs"][2]["label"] == "Barnawapara Sanctuary"


def test_unsupported_locale_returns_400(client, published_entry):
    response = client.get(f"/api/content/{published_entry.slug}?locale=fr")
    assert response.status_code == 400
    assert "Unsupported locale" in response.json()["detail"]


def test_sitemap_endpoint_returns_only_published(client, published_entry, draft_entry):
    response = client.get("/api/content/sitemap")
    assert response.status_code == 200

    items = response.json()
    slugs = [item["slug"] for item in items]
    assert published_entry.slug in slugs
    assert draft_entry.slug not in slugs


def test_authenticated_preview_endpoint_loads_draft(client, draft_entry):
    response = client.get(f"/api/content/preview/{draft_entry.id}?locale=en")
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == str(draft_entry.id)
    assert "[Preview]" in data["seo_title"]
    assert data["name"] == "Draft Destination"


def test_preview_nonexistent_returns_404(client):
    import uuid
    response = client.get(f"/api/content/preview/{uuid.uuid4()}")
    assert response.status_code == 404
