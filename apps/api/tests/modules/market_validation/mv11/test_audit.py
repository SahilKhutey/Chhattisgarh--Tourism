def test_pilot_audit_trail_recorded(client, operator_headers):
    create_resp = client.post(
        "/api/v1/market-validation/pilots",
        json={"name": "Audited Pilot", "validation_decision_id": "MV10-GO-AUDIT"},
        headers=operator_headers,
    )
    pilot_id = create_resp.json()["id"]

    audit_resp = client.get(f"/api/v1/market-validation/pilots/{pilot_id}/audit-trail")
    assert audit_resp.status_code == 200
    events = audit_resp.json()
    assert len(events) >= 1
    assert events[0]["event_type"] == "pilot_created"
    assert events[0]["actor_role"] == "PILOT_OPERATOR"
