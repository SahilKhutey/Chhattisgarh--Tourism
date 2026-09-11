def test_publish_and_archive_lifecycle(client, destination_template):
    template, _ = destination_template

    # 1. Create
    res = client.post(
        f"/api/admin/content-entries/templates/{template.id}",
        json={
            "title": "Bhoramdeo Temple",
            "values": {"name": "Bhoramdeo Temple", "category": "heritage"},
        },
    )
    assert res.status_code == 201
    entry_id = res.json()["id"]
    assert res.json()["status"] == "DRAFT"

    # 2. Publish
    pub_res = client.post(f"/api/admin/content-entries/{entry_id}/publish")
    assert pub_res.status_code == 200
    assert pub_res.json()["status"] == "PUBLISHED"
    assert pub_res.json()["published_at"] is not None

    # 3. Archive
    arch_res = client.post(f"/api/admin/content-entries/{entry_id}/archive")
    assert arch_res.status_code == 200
    assert arch_res.json()["status"] == "ARCHIVED"
