def test_unauthorized_user_cannot_create_pilot(client, unauthorized_headers):
    resp = client.post(
        "/api/v1/market-validation/pilots",
        json={"name": "Hacker Pilot", "validation_decision_id": "MV10-GO-001"},
        headers=unauthorized_headers,
    )
    assert resp.status_code == 403


def test_operator_cannot_approve_pilot_promotion(client, operator_headers):
    # Transitioning to APPROVED requires approver privilege
    pilots = client.get("/api/v1/market-validation/pilots").json()
    pilot_id = pilots[0]["id"]

    # Transition to APPROVED by simple operator should fail with 403
    resp = client.post(
        f"/api/v1/market-validation/pilots/{pilot_id}/transition/APPROVED",
        headers=operator_headers,
    )
    assert resp.status_code == 403
