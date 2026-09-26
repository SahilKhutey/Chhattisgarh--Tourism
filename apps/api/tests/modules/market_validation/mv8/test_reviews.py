from fastapi.testclient import TestClient


def test_review_validation_and_downstream_impact(client: TestClient, researcher_headers: dict):
    # 1. Record review validation
    rev_resp = client.post(
        "/api/v1/market-validation/retention/reviews",
        json={
            "review_id": "rev-bastar-001",
            "experience_id": "exp-kanger-valley",
            "provider_id": "prov-homestay-001",
            "consumer_id": "traveler-sarah",
            "verified_experience": True,
            "rating": 4.8,
            "review_length": 240,
            "media_attached": True,
            "experience_specificity": "DETAILED",
        },
        headers=researcher_headers,
    )
    assert rev_resp.status_code == 201
    rev_id = rev_resp.json()["id"]

    # 2. Record downstream impact: views, saves, booking
    client.post(
        f"/api/v1/market-validation/retention/reviews/{rev_id}/impact",
        json={"event_type": "VIEW"},
        headers=researcher_headers,
    )
    client.post(
        f"/api/v1/market-validation/retention/reviews/{rev_id}/impact",
        json={"event_type": "SAVE"},
        headers=researcher_headers,
    )
    client.post(
        f"/api/v1/market-validation/retention/reviews/{rev_id}/impact",
        json={"event_type": "BOOKING"},
        headers=researcher_headers,
    )

    # 3. Check quality metrics
    q_resp = client.get("/api/v1/market-validation/retention/reviews/quality", headers=researcher_headers)
    assert q_resp.status_code == 200
    q_data = q_resp.json()
    assert q_data["total_reviews"] >= 1
    assert q_data["verified_review_percentage"] == 1.0

    # 4. Check impact metrics
    imp_resp = client.get("/api/v1/market-validation/retention/reviews/impact", headers=researcher_headers)
    assert imp_resp.status_code == 200
    imp_data = imp_resp.json()
    assert imp_data["total_downstream_views"] >= 1
    assert imp_data["total_downstream_saves"] >= 1
    assert imp_data["total_downstream_bookings"] >= 1
