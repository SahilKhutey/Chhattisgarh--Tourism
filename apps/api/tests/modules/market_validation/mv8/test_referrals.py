from fastapi.testclient import TestClient


def test_referral_lifecycle_and_funnel(client: TestClient, researcher_headers: dict):
    # 1. Create referral
    create_resp = client.post(
        "/api/v1/market-validation/retention/referrals",
        json={
            "referrer_id": "referrer-alice-01",
            "referral_channel": "WHATSAPP",
            "trip_id": "trip-bastar-3days",
            "context_type": "TRIP",
        },
        headers=researcher_headers,
    )
    assert create_resp.status_code == 201
    ref = create_resp.json()
    ref_id = ref["id"]
    code = ref["referral_code"]
    assert ref["status"] == "CREATED"

    # 2. Get status
    st_resp = client.get(f"/api/v1/market-validation/retention/referrals/{code}/status", headers=researcher_headers)
    assert st_resp.status_code == 200
    assert st_resp.json()["activated"] is False

    # 3. Recipient opens link (VISIT)
    act_resp1 = client.post(
        f"/api/v1/market-validation/retention/referrals/{code}/activate",
        json={"recipient_anonymous_id": "bob-recipient-01", "action": "VISIT"},
        headers=researcher_headers,
    )
    assert act_resp1.status_code == 200
    assert act_resp1.json()["status"] == "OPENED"

    # 4. Recipient activates / plans trip
    act_resp2 = client.post(
        f"/api/v1/market-validation/retention/referrals/{code}/activate",
        json={"recipient_anonymous_id": "bob-recipient-01", "action": "ACTIVATED"},
        headers=researcher_headers,
    )
    assert act_resp2.status_code == 200
    assert act_resp2.json()["status"] == "ACTIVATED"

    # 5. Check funnel metrics
    funnel_resp = client.get("/api/v1/market-validation/retention/referrals/funnel", headers=researcher_headers)
    assert funnel_resp.status_code == 200
    funnel = funnel_resp.json()
    assert funnel["total_shares"] >= 1
    assert funnel["links_opened"] >= 1
    assert funnel["activated_users"] >= 1
