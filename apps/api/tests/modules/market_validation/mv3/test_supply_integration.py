import uuid
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient


def test_end_to_end_supply_lifecycle(client: TestClient, researcher_headers: dict):
    # 1. Register a provider (Bastar tribal homestay)
    p_resp = client.post(
        "/api/v1/market-validation/providers",
        json={
            "provider_type": "HOMESTAY",
            "segment": "MICRO_BUSINESS",
            "business_name": "Bastar Green Homestay",
            "geography": "BASTAR",
            "operating_area": "Tokapal",
            "digital_presence": "BASIC_DIGITAL",
            "acquisition_channels": ["WORD_OF_MOUTH", "LOCAL_MARKET"],
            "booking_method": "WHATSAPP",
            "response_method": "PHONE",
            "willingness_to_participate": True,
            "willingness_to_pay": "COMMISSION",
        },
        headers=researcher_headers,
    )
    assert p_resp.status_code == 201
    provider_id = p_resp.json()["id"]

    # 2. Record provider field interview
    res_resp = client.post(
        f"/api/v1/market-validation/providers/{provider_id}/research",
        json={
            "researcher_id": "RS-BASTAR-01",
            "interview_date": "2026-09-25T11:00:00Z",
            "duration_minutes": 50,
            "current_pain": "Travelers only come during Dussehra, low occupancy other months",
            "desired_outcome": "Consistent monthly bookings of 4-6 groups",
            "demand_problem": "Off-season vacancy",
            "digital_problem": "No Google Maps pin or online reservation",
        },
        headers=researcher_headers,
    )
    assert res_resp.status_code == 201

    # 3. Provider starts onboarding
    onb_start = client.post(
        f"/api/v1/market-validation/onboarding/{provider_id}/start",
        json={"questions_asked": ["stay_capacity", "meal_options", "phone"]},
        headers=researcher_headers,
    )
    assert onb_start.status_code == 201
    assert onb_start.json()["current_step"] == 1

    # 4. Progress step 4
    onb_step = client.patch(
        f"/api/v1/market-validation/onboarding/{provider_id}/step",
        json={"step": 4, "required_fields_completed": True},
        headers=researcher_headers,
    )
    assert onb_step.status_code == 200

    # 5. Complete onboarding & activate provider
    onb_comp = client.post(
        f"/api/v1/market-validation/onboarding/{provider_id}/complete",
        json={"required_fields_completed": True, "activate_provider": True},
        headers=researcher_headers,
    )
    assert onb_comp.status_code == 200
    assert onb_comp.json()["status"] == "COMPLETED"

    # Verify provider is verified
    p_check = client.get(f"/api/v1/market-validation/providers/{provider_id}", headers=researcher_headers)
    assert p_check.json()["verification_status"] == "VERIFIED"

    # 6. Create listing experiment
    listing_resp = client.post(
        "/api/v1/market-validation/listings",
        json={
            "provider_id": provider_id,
            "template_id": "RURAL_HOMESTAY_V1",
            "status": "DRAFT",
            "information_score": 85,
            "media_score": 75,
            "location_score": 90,
            "service_score": 80,
            "contact_score": 95,
            "trust_score": 85,
        },
        headers=researcher_headers,
    )
    assert listing_resp.status_code == 201
    listing_id = listing_resp.json()["id"]

    # 7. Publish listing
    pub_resp = client.post(
        f"/api/v1/market-validation/listings/{listing_id}/publish",
        headers=researcher_headers,
    )
    assert pub_resp.status_code == 200
    assert pub_resp.json()["status"] == "PUBLISHED"

    # 8. Traveler discovers listing and submits a booking lead
    lead_resp = client.post(
        "/api/v1/market-validation/leads",
        json={
            "provider_id": provider_id,
            "source": "DISCOVERY",
            "traveler_segment": "ECO_TOURIST",
            "destination": "Tokapal, Bastar",
            "experience": "Tribal Farmstay 3 Nights",
            "request_type": "BOOKING_REQUEST",
        },
        headers=researcher_headers,
    )
    assert lead_resp.status_code == 201
    lead_id = lead_resp.json()["id"]

    # 9. Lead qualification
    qual_resp = client.post(f"/api/v1/market-validation/leads/{lead_id}/qualify", headers=researcher_headers)
    assert qual_resp.status_code == 200
    assert qual_resp.json()["qualified"] is True

    # 10. Provider responds within 20 minutes
    created_at = datetime.fromisoformat(lead_resp.json()["created_at"].replace("Z", "+00:00"))
    resp_time = created_at + timedelta(minutes=20)
    res_resp = client.post(
        f"/api/v1/market-validation/leads/{lead_id}/response",
        json={
            "response_at": resp_time.isoformat(),
            "status": "RESPONDED",
            "outcome": "CONNECTED_ON_WHATSAPP",
        },
        headers=researcher_headers,
    )
    assert res_resp.status_code == 200
    assert res_resp.json()["response_time_seconds"] == 1200

    # 11. Lead converted to booking
    book_resp = client.post(
        f"/api/v1/market-validation/leads/{lead_id}/booking",
        json={
            "status": "BOOKED",
            "conversion_status": "CONVERTED",
            "outcome": "BOOKING_CONFIRMED_RS_7500",
        },
        headers=researcher_headers,
    )
    assert book_resp.status_code == 200
    assert book_resp.json()["status"] == "BOOKED"

    # 12. Provider feedback recorded
    fb_resp = client.post(
        "/api/v1/market-validation/provider-feedback",
        json={
            "provider_id": provider_id,
            "journey": "LEAD_RECEIPT",
            "feature": "WHATSAPP_LINK",
            "sentiment": "POSITIVE",
            "difficulty": 1,
            "value": "Connected instantly with verified traveler who actually arrived",
            "willingness_to_continue": True,
            "willingness_to_pay": "COMMISSION_10_PERCENT",
        },
        headers=researcher_headers,
    )
    assert fb_resp.status_code == 201

    # 13. Update metrics and recalculate
    rec_metric = client.post(
        f"/api/v1/market-validation/provider-metrics/{provider_id}/recalculate",
        headers=researcher_headers,
    )
    assert rec_metric.status_code == 200
    m_data = rec_metric.json()
    assert m_data["contacts"] == 1
    assert m_data["qualified_leads"] == 1
    assert m_data["bookings"] == 1
    assert m_data["conversion_rate"] == 1.0
    assert m_data["response_time_avg_seconds"] == 1200

    # 14. Supply analysis funnel
    funnel_resp = client.get("/api/v1/market-validation/analysis/provider-funnel", headers=researcher_headers)
    assert funnel_resp.status_code == 200
    f_data = funnel_resp.json()
    assert f_data["total_providers"] >= 1
    assert f_data["onboarded_providers"] >= 1
    assert f_data["published_listings"] >= 1
    assert f_data["qualified_leads"] >= 1
    assert f_data["bookings"] >= 1
    assert f_data["onboarding_completion_rate"] > 0
    assert f_data["booking_conversion_rate"] > 0

    # 15. Supply response analysis
    resp_ana = client.get("/api/v1/market-validation/analysis/provider-response", headers=researcher_headers)
    assert resp_ana.status_code == 200
    r_data = resp_ana.json()
    assert r_data["response_rate"] > 0
    assert r_data["avg_response_time_seconds"] > 0
    assert r_data["response_buckets"]["under_1h"] >= 1
