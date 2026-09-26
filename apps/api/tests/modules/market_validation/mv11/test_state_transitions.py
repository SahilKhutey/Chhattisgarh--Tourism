def test_pilot_state_machine_valid_transitions(client, operator_headers, approver_headers):
    # 1. Create DRAFT
    create_resp = client.post(
        "/api/v1/market-validation/pilots",
        json={"name": "Lifecycle Pilot", "validation_decision_id": "MV10-GO-LIFECYCLE"},
        headers=operator_headers,
    )
    pilot_id = create_resp.json()["id"]

    # 2. DRAFT -> DESIGNED
    t1 = client.post(f"/api/v1/market-validation/pilots/{pilot_id}/transition/DESIGNED", headers=operator_headers)
    assert t1.status_code == 200
    assert t1.json()["status"] == "DESIGNED"

    # 3. DESIGNED -> APPROVED (requires approver)
    t2 = client.post(f"/api/v1/market-validation/pilots/{pilot_id}/transition/APPROVED", headers=approver_headers)
    assert t2.status_code == 200
    assert t2.json()["status"] == "APPROVED"

    # 4. APPROVED -> READY
    t3 = client.post(f"/api/v1/market-validation/pilots/{pilot_id}/transition/READY", headers=operator_headers)
    assert t3.status_code == 200
    assert t3.json()["status"] == "READY"

    # 5. READY -> ACTIVE
    t4 = client.post(f"/api/v1/market-validation/pilots/{pilot_id}/transition/ACTIVE", headers=operator_headers)
    assert t4.status_code == 200
    assert t4.json()["status"] == "ACTIVE"

    # 6. ACTIVE -> PAUSED -> ACTIVE
    pause = client.post(f"/api/v1/market-validation/pilots/{pilot_id}/pause", headers=operator_headers)
    assert pause.status_code == 200
    assert pause.json()["status"] == "PAUSED"

    resume = client.post(f"/api/v1/market-validation/pilots/{pilot_id}/resume", headers=operator_headers)
    assert resume.status_code == 200
    assert resume.json()["status"] == "ACTIVE"

    # 7. ACTIVE -> COMPLETED
    complete = client.post(f"/api/v1/market-validation/pilots/{pilot_id}/complete", headers=operator_headers)
    assert complete.status_code == 200
    assert complete.json()["status"] == "COMPLETED"


def test_invalid_transition_returns_409(client, operator_headers):
    # Create DRAFT
    create_resp = client.post(
        "/api/v1/market-validation/pilots",
        json={"name": "Jump Pilot", "validation_decision_id": "MV10-GO-JUMP"},
        headers=operator_headers,
    )
    pilot_id = create_resp.json()["id"]

    # Try illegal transition DRAFT -> ACTIVE
    resp = client.post(f"/api/v1/market-validation/pilots/{pilot_id}/transition/ACTIVE", headers=operator_headers)
    assert resp.status_code == 409
    assert "Invalid pilot transition" in resp.json()["detail"]


def test_optimistic_locking_conflict(client, operator_headers):
    create_resp = client.post(
        "/api/v1/market-validation/pilots",
        json={"name": "Concurrency Pilot", "validation_decision_id": "MV10-GO-LOCK"},
        headers=operator_headers,
    )
    pilot = create_resp.json()
    pilot_id = pilot["id"]
    initial_version = pilot["version"]

    # Provide mismatched If-Match
    conflict_headers = dict(operator_headers)
    conflict_headers["If-Match"] = str(initial_version + 5)

    resp = client.put(
        f"/api/v1/market-validation/pilots/{pilot_id}",
        json={"name": "Concurrent Edit"},
        headers=conflict_headers,
    )
    assert resp.status_code == 409
    assert "Optimistic lock conflict" in resp.json()["detail"]
