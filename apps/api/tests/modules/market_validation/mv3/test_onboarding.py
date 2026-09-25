import uuid
from fastapi.testclient import TestClient


def create_test_provider(client: TestClient, headers: dict) -> str:
    resp = client.post(
        "/api/v1/market-validation/providers",
        json={
            "provider_type": "HOMESTAY",
            "segment": "MICRO_BUSINESS",
            "business_name": "Tirathgarh Jungle Retreat",
            "geography": "BASTAR",
            "operating_area": "Tirathgarh",
        },
        headers=headers,
    )
    return resp.json()["id"]


def test_onboarding_started(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    resp = client.post(
        f"/api/v1/market-validation/onboarding/{provider_id}/start",
        json={"questions_asked": ["business_name", "category"]},
        headers=researcher_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["provider_id"] == provider_id
    assert data["status"] == "STARTED"
    assert data["current_step"] == 1
    assert data["completion_rate"] == 0.14
    assert data["required_fields_completed"] is False


def test_onboarding_step_progression(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    client.post(f"/api/v1/market-validation/onboarding/{provider_id}/start", headers=researcher_headers)

    resp = client.patch(
        f"/api/v1/market-validation/onboarding/{provider_id}/step",
        json={"step": 4, "required_fields_completed": False},
        headers=researcher_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["current_step"] == 4
    assert data["status"] == "IN_PROGRESS"
    assert data["completion_rate"] == 0.57


def test_onboarding_completion(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    client.post(f"/api/v1/market-validation/onboarding/{provider_id}/start", headers=researcher_headers)

    resp = client.post(
        f"/api/v1/market-validation/onboarding/{provider_id}/complete",
        json={"required_fields_completed": True, "activate_provider": True},
        headers=researcher_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "COMPLETED"
    assert data["current_step"] == 7
    assert data["completion_rate"] == 1.0
    assert data["required_fields_completed"] is True
    assert data["completed_at"] is not None

    # Verify provider verification status is now VERIFIED
    p_resp = client.get(f"/api/v1/market-validation/providers/{provider_id}", headers=researcher_headers)
    assert p_resp.json()["verification_status"] == "VERIFIED"


def test_activation_requires_required_fields(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    client.post(f"/api/v1/market-validation/onboarding/{provider_id}/start", headers=researcher_headers)

    # Attempting to complete with required_fields_completed = False should fail
    resp = client.post(
        f"/api/v1/market-validation/onboarding/{provider_id}/complete",
        json={"required_fields_completed": False, "activate_provider": True},
        headers=researcher_headers,
    )
    assert resp.status_code == 400
    assert "required fields are incomplete" in resp.json()["detail"]


def test_incomplete_provider_not_activated(client: TestClient, researcher_headers: dict):
    provider_id = create_test_provider(client, researcher_headers)
    client.post(f"/api/v1/market-validation/onboarding/{provider_id}/start", headers=researcher_headers)

    p_resp = client.get(f"/api/v1/market-validation/providers/{provider_id}", headers=researcher_headers)
    assert p_resp.json()["verification_status"] == "UNVERIFIED"
