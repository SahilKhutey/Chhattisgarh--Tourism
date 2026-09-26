def test_pilot_cohort_metrics(client, operator_headers):
    pilots = client.get("/api/v1/market-validation/pilots").json()
    pilot_id = pilots[0]["id"]

    cohort_data = {
        "pilot_id": pilot_id,
        "cohort_name": "Week 1 Raipur Explorers",
        "acquisition_channel": "INSTAGRAM_CAMPAIGN",
        "consumer_segment": "EXPERIENTIAL_EXPLORERS",
        "geography": "Bastar",
        "language": "hi",
        "device": "MOBILE",
        "users": 150,
        "activated_users": 95,
        "planners": 40,
        "leads": 22,
        "bookings": 8,
        "completed_experiences": 7,
        "returning_users": 3,
    }
    resp = client.post(f"/api/v1/market-validation/pilots/{pilot_id}/cohorts", json=cohort_data, headers=operator_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["cohort_name"] == "Week 1 Raipur Explorers"
    assert data["completed_experiences"] == 7

    # List cohorts
    list_resp = client.get(f"/api/v1/market-validation/pilots/{pilot_id}/cohorts")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1
