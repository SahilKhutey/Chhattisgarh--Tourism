import pytest


def test_offers_and_orders_lifecycle(client, finance_admin_headers):
    # 1. Offers list
    offers_resp = client.get("/api/v1/market-validation/business/offers", headers=finance_admin_headers)
    assert offers_resp.status_code == 200
    offers = offers_resp.json()
    assert len(offers) >= 3

    target_offer = offers[0]
    offer_id = target_offer["id"]

    # 2. Create order with idempotency key
    idempotency_key = "idemp-mv9-order-test-001"
    order_payload = {
        "offer_id": offer_id,
        "customer_type": "PROVIDER",
        "customer_id": "provider-bastar-camp-01",
        "amount": target_offer["price"],
        "currency": "INR",
        "idempotency_key": idempotency_key,
        "variable_cost": 5.0,
        "metadata": {"source": "inquiry_checkout"},
    }
    order_resp = client.post("/api/v1/market-validation/business/orders", json=order_payload, headers=finance_admin_headers)
    assert order_resp.status_code == 201
    order_data = order_resp.json()
    assert order_data["status"] == "INITIATED"
    assert order_data["amount"] == target_offer["price"]
    assert order_data["contribution_margin"] == round(target_offer["price"] - 5.0, 2)
    order_id = order_data["id"]

    # 3. Idempotent re-submission returns original order
    dup_resp = client.post("/api/v1/market-validation/business/orders", json=order_payload, headers=finance_admin_headers)
    assert dup_resp.status_code == 201
    assert dup_resp.json()["id"] == order_id

    # 4. Advance order to PAID
    pay_resp = client.patch(
        f"/api/v1/market-validation/business/orders/{order_id}/status",
        json={"status": "PAID"},
        headers=finance_admin_headers,
    )
    assert pay_resp.status_code == 200
    assert pay_resp.json()["status"] == "PAID"

    # 5. Advance to COMPLETED
    complete_resp = client.patch(
        f"/api/v1/market-validation/business/orders/{order_id}/status",
        json={"status": "COMPLETED"},
        headers=finance_admin_headers,
    )
    assert complete_resp.status_code == 200
    assert complete_resp.json()["status"] == "COMPLETED"

    # 6. Refund order
    refund_resp = client.patch(
        f"/api/v1/market-validation/business/orders/{order_id}/status",
        json={"status": "REFUNDED", "refund_amount": 50.0, "refund_reason": "Traveler canceled trip dates"},
        headers=finance_admin_headers,
    )
    assert refund_resp.status_code == 200
    assert refund_resp.json()["status"] == "REFUNDED"
    assert refund_resp.json()["refund_amount"] == 50.0


def test_trust_policies_protection(client, researcher_headers):
    pol_resp = client.get("/api/v1/market-validation/business/policies", headers=researcher_headers)
    assert pol_resp.status_code == 200
    policies = pol_resp.json()
    assert len(policies) >= 4

    # Verify discovery policy has 0 ranking influence
    discovery_pol = next((p for p in policies if p["revenue_model"] == "FREE_DISCOVERY"), None)
    assert discovery_pol is not None
    assert discovery_pol["ranking_influence"] == "NONE"
    assert discovery_pol["trust_risk"] == 0.0
