import pytest


def test_experiment_observations_and_evaluation(client, researcher_headers):
    experiment_id = "exp-lead-pricing-test-01"

    # 1. Record observations for Variant B
    payload = {
        "experiment_id": experiment_id,
        "participant_id": "homestay-chitrakote-02",
        "variant": "VARIANT_B",
        "offer": "Verified Lead Bundle",
        "observed_action": "PURCHASE",
        "price": 25.0,
        "committed": True,
        "paid": True,
        "outcome": "SUCCESS",
        "evidence": "Provider paid ₹25 via UPI without objection.",
    }
    rec_resp = client.post(
        "/api/v1/market-validation/business/experiments/observations",
        json=payload,
        headers=researcher_headers,
    )
    assert rec_resp.status_code == 201
    assert rec_resp.json()["paid"] is True

    # 2. Evaluate experiment
    eval_resp = client.get(
        f"/api/v1/market-validation/business/experiments/{experiment_id}/evaluate",
        headers=researcher_headers,
    )
    assert eval_resp.status_code == 200
    eval_data = eval_resp.json()
    assert eval_data["experiment_id"] == experiment_id
    assert "variants" in eval_data
    assert eval_data["decision"] in ("WINNER_VARIANT", "INCONCLUSIVE", "CONTROL_SUPERIOR")
