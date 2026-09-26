import pytest


def test_list_and_create_revenue_streams(client, researcher_headers):
    # Initial list triggers default streams initialization
    list_resp = client.get("/api/v1/market-validation/business/revenue-streams", headers=researcher_headers)
    assert list_resp.status_code == 200
    streams = list_resp.json()
    assert len(streams) >= 5

    # Check that qualified lead fee stream exists
    lead_stream = next((s for s in streams if s["stream_type"] == "QUALIFIED_LEAD_FEE"), None)
    assert lead_stream is not None
    assert lead_stream["base_price"] == 25.0
    assert lead_stream["currency"] == "INR"

    # Create new stream
    new_stream_payload = {
        "business_model_id": None,
        "customer_type": "PROVIDER",
        "stream_type": "EQUIPMENT_RENTAL_FEE",
        "description": "5% fee on kayak/camping gear reservation facilitation",
        "value_created": "Gear rental management and security deposits",
        "payment_trigger": "Booking confirmation",
        "pricing_unit": "per transaction",
        "base_price": 50.0,
        "currency": "INR",
        "estimated_frequency": "WEEKLY",
        "estimated_conversion": 0.15,
        "estimated_margin": 0.85,
        "status": "ACTIVE",
        "evidence_strength": "MODERATE",
    }
    create_resp = client.post(
        "/api/v1/market-validation/business/revenue-streams", json=new_stream_payload, headers=researcher_headers
    )
    assert create_resp.status_code == 201
    assert create_resp.json()["stream_type"] == "EQUIPMENT_RENTAL_FEE"
