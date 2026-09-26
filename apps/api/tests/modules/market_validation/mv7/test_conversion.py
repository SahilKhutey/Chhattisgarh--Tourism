from fastapi.testclient import TestClient


def test_conversion_tracking_and_funnel(client: TestClient, researcher_headers: dict, test_provider):
    # Create lead -> CONTACT conversion
    lead_resp = client.post(
        "/api/v1/market-validation/transactions/leads",
        json={
            "provider_id": str(test_provider.id),
            "consumer_id": "c_conv_user",
            "message": "Planning family vacation tour",
        },
        headers=researcher_headers,
    )
    lead_id = lead_resp.json()["id"]

    # List conversions - should see CONTACT
    conv_resp = client.get("/api/v1/market-validation/transactions/conversion", headers=researcher_headers)
    assert conv_resp.status_code == 200
    items = conv_resp.json()
    assert any(c["conversion_stage"] == "CONTACT" for c in items)

    # Qualify lead -> QUALIFIED conversion
    client.post(
        f"/api/v1/market-validation/transactions/leads/{lead_id}/qualify",
        json={"qualification_status": "QUALIFIED"},
        headers=researcher_headers,
    )

    # Create Booking Intent -> BOOKING_INTENT conversion
    bint_resp = client.post(
        "/api/v1/market-validation/transactions/booking-intent",
        json={
            "lead_id": str(lead_id),
            "provider_id": str(test_provider.id),
            "amount_estimate": 3200.0,
        },
        headers=researcher_headers,
    )
    intent_id = bint_resp.json()["intent_id"]

    # Confirm Booking -> BOOKED conversion
    client.post(
        f"/api/v1/market-validation/transactions/booking-intent/{intent_id}/confirm",
        json={"role": "CONSUMER"},
        headers=researcher_headers,
    )

    # Get funnel
    funnel_resp = client.get("/api/v1/market-validation/transactions/conversion/funnel", headers=researcher_headers)
    assert funnel_resp.status_code == 200
    funnel = funnel_resp.json()
    assert funnel["total_views"] > 0
    assert len(funnel["stages"]) == 7
    stage_names = [s["stage"] for s in funnel["stages"]]
    assert "Provider View" in stage_names
    assert "Contact / Lead" in stage_names
    assert "Qualified Lead" in stage_names
    assert "Booking Intent" in stage_names
    assert "Booking" in stage_names
