from fastapi.testclient import TestClient


def test_record_and_get_attribution(client: TestClient, researcher_headers: dict, test_provider):
    payload = {
        "booking_id": "BOOKING_ATTR_101",
        "lead_id": "LEAD_ATTR_101",
        "anonymous_user_id": "anon_explorer_33",
        "session_id": "sess_explorer_33",
        "source_event_id": "DISC_EVT_909",
        "discovery_source": "THEMATIC_SEARCH",
        "destination_id": "DEST_CHITRAKOTE",
        "experience_id": "EXP_BOATING",
        "provider_id": str(test_provider.id),
        "campaign_id": "CAMP_MONSOON_BASTAR",
        "experiment_id": "H-MV7-003",
        "attribution_window_days": 30,
        "chain_details": {
            "search_query": "Chitrakote boating sunset",
            "destination_viewed_at": "2024-09-20T10:00:00Z",
            "provider_clicked_at": "2024-09-20T10:05:00Z",
        },
    }
    rec_resp = client.post("/api/v1/market-validation/transactions/attribution", json=payload, headers=researcher_headers)
    assert rec_resp.status_code == 201
    data = rec_resp.json()
    assert data["booking_id"] == "BOOKING_ATTR_101"
    assert data["discovery_source"] == "THEMATIC_SEARCH"

    # Query attribution by booking_id
    get_resp = client.get("/api/v1/market-validation/transactions/attribution/BOOKING_ATTR_101", headers=researcher_headers)
    assert get_resp.status_code == 200
    attr_data = get_resp.json()
    assert attr_data["anonymous_user_id"] == "anon_explorer_33"
    assert attr_data["chain_details"]["search_query"] == "Chitrakote boating sunset"
