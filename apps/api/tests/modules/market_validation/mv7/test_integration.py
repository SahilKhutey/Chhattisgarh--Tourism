import uuid
from fastapi.testclient import TestClient


def test_mv7_full_lifecycle_integration(client: TestClient, researcher_headers: dict, test_provider):
    # 1. Traveler discovers experience and submits Lead
    lead_payload = {
        "provider_id": str(test_provider.id),
        "consumer_id": "traveler_sharma",
        "anonymous_user_id": "anon_sharma_98",
        "session_id": "sess_bastar_monsoon",
        "source": "THEMATIC_SEARCH",
        "destination_id": "DEST_CHITRAKOTE",
        "experience_id": "EXP_WATERFALL_BOATING",
        "request_type": "BOOKING_REQUEST",
        "traveler_count": 4,
        "budget_band": "COMFORT",
        "message": "We are 4 adults looking for a guided tour of Chitrakote and Tirathgarh on October 5th.",
    }
    lead_res = client.post("/api/v1/market-validation/transactions/leads", json=lead_payload, headers=researcher_headers)
    assert lead_res.status_code == 201
    lead_data = lead_res.json()
    lead_id = lead_data["lead_id"]
    lead_uuid = lead_data["id"]

    # 2. System qualifies lead
    qual_res = client.post(
        f"/api/v1/market-validation/transactions/leads/{lead_uuid}/qualify",
        json={"qualification_status": "QUALIFIED"},
        headers=researcher_headers,
    )
    assert qual_res.status_code == 200
    assert qual_res.json()["qualified"] is True

    # 3. Provider responds to lead
    resp_res = client.post(
        f"/api/v1/market-validation/transactions/leads/{lead_uuid}/respond",
        json={
            "response_type": "ACCEPT",
            "response_message": "Namaste! I would be delighted to guide your family. Price is ₹3,000 including vehicle permit.",
            "offered_price": 3000.0,
        },
        headers=researcher_headers,
    )
    assert resp_res.status_code == 200
    assert resp_res.json()["response_type"] == "ACCEPT"

    # 4. Consumer submits Booking Intent
    intent_payload = {
        "lead_id": lead_id,
        "consumer_id": "traveler_sharma",
        "provider_id": str(test_provider.id),
        "experience_id": "EXP_WATERFALL_BOATING",
        "traveler_count": 4,
        "amount_estimate": 3000.0,
        "idempotency_key": "idemp_sharma_booking_001",
    }
    intent_res = client.post(
        "/api/v1/market-validation/transactions/booking-intent",
        json=intent_payload,
        headers={**researcher_headers, "Idempotency-Key": "idemp_sharma_booking_001"},
    )
    assert intent_res.status_code == 201
    intent_data = intent_res.json()
    intent_id = intent_data["intent_id"]

    # 5. Confirm Booking
    confirm_res = client.post(
        f"/api/v1/market-validation/transactions/booking-intent/{intent_id}/confirm",
        json={"role": "CONSUMER"},
        headers={**researcher_headers, "Idempotency-Key": "idemp_sharma_confirm_001"},
    )
    assert confirm_res.status_code == 200
    assert confirm_res.json()["status"] == "BOOKED"

    # 6. Record Discovery Attribution
    attr_res = client.post(
        "/api/v1/market-validation/transactions/attribution",
        json={
            "booking_id": intent_id,
            "lead_id": lead_id,
            "anonymous_user_id": "anon_sharma_98",
            "session_id": "sess_bastar_monsoon",
            "discovery_source": "THEMATIC_SEARCH",
            "destination_id": "DEST_CHITRAKOTE",
            "provider_id": str(test_provider.id),
        },
        headers=researcher_headers,
    )
    assert attr_res.status_code == 201

    # 7. Experience Completed on ground
    tx_list = client.get("/api/v1/market-validation/transactions/", headers=researcher_headers).json()
    tx = next(t for t in tx_list if t["booking_id"] == intent_id)
    tx_id = tx["transaction_id"]

    comp_res = client.post(
        f"/api/v1/market-validation/transactions/{tx_id}/complete",
        json={"role": "ALL", "completion_status": "COMPLETED"},
        headers=researcher_headers,
    )
    assert comp_res.status_code == 200
    assert comp_res.json()["completion_status"] == "COMPLETED"

    # 8. Feedback submitted
    fb_res = client.post(
        f"/api/v1/market-validation/transactions/{tx_id}/feedback",
        json={
            "provider_id": str(test_provider.id),
            "consumer_id": "traveler_sharma",
            "feedback_type": "PROVIDER_FEEDBACK",
            "lead_quality_score": 95.0,
            "continuation_intent": True,
        },
        headers=researcher_headers,
    )
    assert fb_res.status_code == 200

    # 9. Verify Economic Value & Conversion Funnel
    econ_res = client.get("/api/v1/market-validation/transactions/analysis/economic-value", headers=researcher_headers).json()
    assert econ_res["gross_tourism_value_facilitated"] >= 3000.0
    assert econ_res["completed_bookings_count"] >= 1

    funnel_res = client.get("/api/v1/market-validation/transactions/conversion/funnel", headers=researcher_headers).json()
    assert funnel_res["total_views"] > 0
    assert len(funnel_res["stages"]) == 7
