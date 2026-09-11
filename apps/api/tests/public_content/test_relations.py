from __future__ import annotations


def test_unpublished_relation_is_hidden(client, published_entry, unpublished_related_entry):
    response = client.get(f"/api/content/{published_entry.slug}")
    assert response.status_code == 200

    data = response.json()
    rel_field = next(f for f in data["fields"] if f["key"] == "nearby_destinations")

    # Since unpublished_related_entry is DRAFT, it must not be exposed in the value list
    assert unpublished_related_entry.slug not in str(rel_field["value"])
    assert len(rel_field["value"]) == 0


def test_published_relation_is_rendered(
    client,
    db_session,
    published_entry,
    unpublished_related_entry,
):
    # Publish the related entry
    unpublished_related_entry.status = "PUBLISHED"
    db_session.commit()

    # Invalidate cache
    from app.modules.public_content.cache import PublicContentCache
    PublicContentCache().invalidate(published_entry.slug)

    response = client.get(f"/api/content/{published_entry.slug}")
    assert response.status_code == 200

    data = response.json()
    rel_field = next(f for f in data["fields"] if f["key"] == "nearby_destinations")

    assert len(rel_field["value"]) == 1
    item = rel_field["value"][0]
    assert item["slug"] == unpublished_related_entry.slug
    assert item["name"] == unpublished_related_entry.title
    assert f"/en/destinations/{unpublished_related_entry.slug}" in item["url"]
