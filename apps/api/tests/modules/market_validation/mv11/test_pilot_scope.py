def test_pilot_product_scope_in_and_out(client, operator_headers):
    # Verify in-scope and out-of-scope boundaries
    payload = {
        "name": "Scoped Pilot",
        "validation_decision_id": "MV10-DECISION-GO-005",
        "product_scope": {
            "in_scope": ["destination_discovery", "trip_planning", "provider_discovery"],
            "out_of_scope": ["statewide_unrestricted_marketplace", "unverified_provider_self_onboarding"],
        },
    }
    resp = client.post("/api/v1/market-validation/pilots", json=payload, headers=operator_headers)
    assert resp.status_code == 201
    scope = resp.json()["product_scope"]
    assert "destination_discovery" in scope["in_scope"]
    assert "statewide_unrestricted_marketplace" in scope["out_of_scope"]
