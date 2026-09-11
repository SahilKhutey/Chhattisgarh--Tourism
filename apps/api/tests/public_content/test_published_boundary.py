from __future__ import annotations


def test_draft_content_is_not_public(client, draft_entry):
    response = client.get(f"/api/content/{draft_entry.slug}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Content not found."


def test_archived_content_is_not_public(client, db_session, published_entry):
    published_entry.status = "ARCHIVED"
    db_session.commit()

    response = client.get(f"/api/content/{published_entry.slug}")
    assert response.status_code == 404


def test_in_review_content_is_not_public(client, db_session, published_entry):
    published_entry.status = "IN_REVIEW"
    db_session.commit()

    response = client.get(f"/api/content/{published_entry.slug}")
    assert response.status_code == 404


def test_public_endpoint_does_not_accept_admin_status_override(client, draft_entry):
    response = client.get(f"/api/content/{draft_entry.slug}?status=PUBLISHED")
    assert response.status_code == 404


def test_preview_query_parameter_does_not_bypass_public_boundary(client, draft_entry):
    response = client.get(f"/api/content/{draft_entry.slug}?preview=true")
    assert response.status_code == 404


def test_nonexistent_slug_returns_404(client):
    response = client.get("/api/content/totally-nonexistent-destination")
    assert response.status_code == 404
