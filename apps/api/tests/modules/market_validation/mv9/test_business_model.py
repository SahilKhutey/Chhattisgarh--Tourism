import pytest


def test_get_business_model_canvas(client, researcher_headers):
    response = client.get("/api/v1/market-validation/business/canvas", headers=researcher_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPILED"
    assert len(data["business_models"]) >= 4
    assert len(data["revenue_streams"]) >= 5
    assert len(data["hypotheses"]) == 10
    # Guardrail check: Free public discovery must be explicitly affirmed
    discovery_model = next((m for m in data["business_models"] if m["revenue_model"] == "FREE_DISCOVERY"), None)
    assert discovery_model is not None


def test_create_and_list_business_models(client, finance_admin_headers):
    payload = {
        "name": "B2B Forest Department Eco-Concession Model",
        "customer_type": "INSTITUTION",
        "value_proposition": "Digital visitor quota management and impact reporting for state sanctuaries.",
        "revenue_model": "INSTITUTIONAL_SaaS",
        "pricing_model": "Annual License",
        "payment_trigger": "Sanctuary Onboarding",
        "cost_structure": "Cloud infra, GIS validation",
        "assumptions": ["Forest department requires paperless permits"],
        "status": "VALIDATING",
        "evidence_strength": "MODERATE",
    }
    create_resp = client.post("/api/v1/market-validation/business/models", json=payload, headers=finance_admin_headers)
    assert create_resp.status_code == 201
    created_id = create_resp.json()["id"]

    list_resp = client.get("/api/v1/market-validation/business/models", headers=finance_admin_headers)
    assert list_resp.status_code == 200
    models = list_resp.json()
    assert any(m["id"] == created_id for m in models)
