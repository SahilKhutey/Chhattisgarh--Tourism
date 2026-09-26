from fastapi.testclient import TestClient
from app.modules.market_validation.provider_response.service import ProviderResponseService


def test_provider_respond_accept(client: TestClient, researcher_headers: dict, test_provider):
    create_resp = client.post(
        "/api/v1/market-validation/transactions/leads",
        json={
            "provider_id": str(test_provider.id),
            "consumer_id": "c_resp",
            "message": "Can you guide us on Sunday?",
        },
        headers=researcher_headers,
    )
    lead_id = create_resp.json()["id"]

    resp = client.post(
        f"/api/v1/market-validation/transactions/leads/{lead_id}/respond",
        json={
            "response_type": "ACCEPT",
            "response_message": "Yes, available on Sunday at 8am. Standard tariff ₹1,500.",
            "offered_price": 1500.0,
        },
        headers=researcher_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["response_type"] == "ACCEPT"
    assert data["offered_price"] == 1500.0
    assert data["response_bucket"] in ["<5m", "5-30m", "30-120m", "2-24h", ">24h"]


def test_provider_decline_with_reason(client: TestClient, researcher_headers: dict, test_provider):
    create_resp = client.post(
        "/api/v1/market-validation/transactions/leads",
        json={
            "provider_id": str(test_provider.id),
            "consumer_id": "c_decline",
            "message": "Guide needed today in 10 mins",
        },
        headers=researcher_headers,
    )
    lead_id = create_resp.json()["id"]

    resp = client.post(
        f"/api/v1/market-validation/transactions/leads/{lead_id}/decline?reason=NO_AVAILABILITY",
        headers=researcher_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["response_type"] == "DECLINED"
    assert "NO_AVAILABILITY" in data["response_message"]


def test_provider_ask_question(client: TestClient, researcher_headers: dict, test_provider):
    create_resp = client.post(
        "/api/v1/market-validation/transactions/leads",
        json={
            "provider_id": str(test_provider.id),
            "consumer_id": "c_quest",
            "message": "Waterfalls trip inquiry",
        },
        headers=researcher_headers,
    )
    lead_id = create_resp.json()["id"]

    resp = client.post(
        f"/api/v1/market-validation/transactions/leads/{lead_id}/question?question=How%20many%20adults%20and%20children?",
        headers=researcher_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["response_type"] == "QUESTION"
    assert "adults and children" in data["response_message"]


def test_sla_bucket_calculation():
    assert ProviderResponseService.determine_response_bucket(120) == "<5m"
    assert ProviderResponseService.determine_response_bucket(900) == "5-30m"
    assert ProviderResponseService.determine_response_bucket(3600) == "30-120m"
    assert ProviderResponseService.determine_response_bucket(14400) == "2-24h"
    assert ProviderResponseService.determine_response_bucket(100000) == ">24h"
