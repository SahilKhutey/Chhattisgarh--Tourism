from datetime import date
from fastapi.testclient import TestClient


def test_create_and_query_cohorts(client: TestClient, researcher_headers: dict):
    resp = client.post(
        "/api/v1/market-validation/retention/cohorts",
        json={
            "cohort_date": str(date.today()),
            "acquisition_source": "SEARCH",
            "first_action": "DESTINATION_DISCOVERY",
            "first_destination": "Bastar",
            "segment": "ECO_TOURIST",
            "traveler_type": "DOMESTIC",
            "geography": "BASTAR",
            "cohort_size": 100,
        },
        headers=researcher_headers,
    )
    assert resp.status_code == 201
    cohort_id = resp.json()["id"]

    # Update metrics: D1, D7, D30 and next trip count
    patch_resp = client.patch(
        f"/api/v1/market-validation/retention/cohorts/{cohort_id}",
        json={
            "d1_retained": 35,
            "d7_retained": 22,
            "d30_retained": 14,
            "trip_cycle_retained": 24,
            "next_trip_count": 18,
            "destinations_expanded_count": 32,
        },
        headers=researcher_headers,
    )
    assert patch_resp.status_code == 200
    data = patch_resp.json()
    assert data["d1_rate"] == 0.35
    assert data["d7_rate"] == 0.22
    assert data["d30_rate"] == 0.14
    assert data["trip_cycle_rate"] == 0.24
    assert data["next_trip_rate"] == 0.18
    assert data["destination_expansion_rate"] == 0.32

    # Query list
    list_resp = client.get("/api/v1/market-validation/retention/cohorts", headers=researcher_headers)
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] >= 1
