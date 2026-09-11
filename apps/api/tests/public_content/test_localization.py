from __future__ import annotations


def test_hindi_content_is_resolved(client, published_entry):
    response = client.get(f"/api/content/{published_entry.slug}?locale=hi")
    assert response.status_code == 200

    data = response.json()
    assert data["locale"] == "hi"
    assert data["name"] == "बारनवापारा वन्यजीव अभयारण्य"

    name_field = next(f for f in data["fields"] if f["key"] == "name")
    assert name_field["value"] == "बारनवापारा वन्यजीव अभयारण्य"

    desc_field = next(f for f in data["fields"] if f["key"] == "description")
    assert "छत्तीसगढ़ का एक प्रसिद्ध" in desc_field["value"]


def test_missing_locale_falls_back_to_default(client, published_entry):
    # 'chg' has no translation stored on this entry
    response = client.get(f"/api/content/{published_entry.slug}?locale=chg")
    assert response.status_code == 200

    data = response.json()
    assert data["locale"] == "chg"
    # Fallback to English
    assert data["name"] == "Barnawapara Sanctuary"

    name_field = next(f for f in data["fields"] if f["key"] == "name")
    assert name_field["value"] == "Barnawapara Sanctuary"
