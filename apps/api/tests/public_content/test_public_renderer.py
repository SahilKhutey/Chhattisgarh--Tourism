from __future__ import annotations

import uuid
from app.modules.content_template.models.template_version import (
    TemplateVersion,
    TemplateVersionField,
)


def test_public_content_uses_bound_template_version(client, db_session, published_entry):
    # 1. Verify initial rendering against bound version 1
    response = client.get(f"/api/content/{published_entry.slug}")
    assert response.status_code == 200
    data = response.json()
    assert data["template_version"] == 1

    initial_field_keys = {f["key"] for f in data["fields"]}
    assert "best_time_to_visit" not in initial_field_keys

    # 2. Simulate new version 2 added to the template
    v2_id = uuid.uuid4()
    version_2 = TemplateVersion(
        id=v2_id,
        template_id=published_entry.template_id,
        version_number=2,
        name="Destination v2",
        slug="destination-v2",
        schema_hash="hash456",
        created_by="admin",
    )
    db_session.add(version_2)

    # Add a new field in version 2
    f_new = TemplateVersionField(
        id=uuid.uuid4(),
        version_id=v2_id,
        key="best_time_to_visit",
        label="Best Time To Visit",
        type="TEXT",
        order=10,
        required=False,
        translatable=True,
        group="Travel Tips",
        config={},
    )
    db_session.add(f_new)

    # Update template's published_version_id to version 2
    published_entry.template.published_version_id = v2_id
    db_session.commit()

    # Clear cache to force fresh resolution
    from app.modules.public_content.cache import PublicContentCache
    PublicContentCache().invalidate(published_entry.slug)

    # 3. Re-query the existing entry: it MUST continue rendering version 1!
    response2 = client.get(f"/api/content/{published_entry.slug}")
    assert response2.status_code == 200
    data2 = response2.json()

    assert data2["template_version"] == 1
    field_keys_after = {f["key"] for f in data2["fields"]}
    assert "best_time_to_visit" not in field_keys_after
