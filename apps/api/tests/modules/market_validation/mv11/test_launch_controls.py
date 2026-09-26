def test_list_and_trigger_launch_controls(client, operator_headers):
    pilots = client.get("/api/v1/market-validation/pilots").json()
    pilot_id = pilots[0]["id"]

    resp = client.get(f"/api/v1/market-validation/launch-controls/{pilot_id}")
    assert resp.status_code == 200
    controls = resp.json()
    assert len(controls) == 4

    # Trigger booking limit control
    booking_ctrl = next(c for c in controls if c["control_type"] == "BOOKING_LIMIT")
    assert not booking_ctrl["triggered"]

    # Update current value above threshold
    update_resp = client.put(
        f"/api/v1/market-validation/launch-controls/control/{booking_ctrl['id']}",
        json={"current_value": 15.0},
        headers=operator_headers,
    )
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["triggered"] is True
    assert updated["action"] == "HALT_BOOKINGS"
