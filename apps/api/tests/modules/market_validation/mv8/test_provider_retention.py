from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient


def test_provider_activity_and_continuation(client: TestClient, researcher_headers: dict):
    provider_id = "provider-bastar-001"

    # 1. Record listing update
    resp1 = client.post(
        "/api/v1/market-validation/retention/providers/activity",
        json={
            "provider_id": provider_id,
            "activity_type": "LISTING_UPDATE",
            "region": "BASTAR",
        },
        headers=researcher_headers,
    )
    assert resp1.status_code == 200
    p1 = resp1.json()
    assert p1["is_active"] is True
    assert p1["listing_update_count"] == 1
    assert p1["continuation_status"] == "CONTINUOUS"

    # 2. Record lead response
    resp2 = client.post(
        "/api/v1/market-validation/retention/providers/activity",
        json={
            "provider_id": provider_id,
            "activity_type": "LEAD_RESPONSE",
        },
        headers=researcher_headers,
    )
    assert resp2.status_code == 200
    assert resp2.json()["total_leads_responded"] == 1

    # 3. Simulate reactivation after 35 days
    future_time = datetime.now(timezone.utc) + timedelta(days=35)
    resp3 = client.post(
        "/api/v1/market-validation/retention/providers/activity",
        json={
            "provider_id": provider_id,
            "activity_type": "LISTING_UPDATE",
            "activity_timestamp": future_time.isoformat(),
        },
        headers=researcher_headers,
    )
    assert resp3.status_code == 200
    assert resp3.json()["continuation_status"] == "REACTIVATED"
    assert resp3.json()["reactivated_count"] >= 1

    # 4. Overview
    overview_resp = client.get("/api/v1/market-validation/retention/providers", headers=researcher_headers)
    assert overview_resp.status_code == 200
    assert overview_resp.json()["total_providers_onboarded"] >= 1
    assert overview_resp.json()["continuation_rate"] > 0

    # 5. Supply density
    density_resp = client.get(
        "/api/v1/market-validation/retention/providers/supply-density?region=BASTAR",
        headers=researcher_headers,
    )
    assert density_resp.status_code == 200
    assert density_resp.json()["region"] == "BASTAR"
