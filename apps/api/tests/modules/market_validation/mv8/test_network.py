from fastapi.testclient import TestClient


def test_network_interactions_and_density(client: TestClient, researcher_headers: dict):
    # 1. Record interactions across actors and targets
    client.post(
        "/api/v1/market-validation/retention/network/interactions",
        json={
            "actor_type": "TRAVELER",
            "actor_id": "traveler-1",
            "target_type": "PROVIDER",
            "target_id": "provider-1",
            "interaction_type": "CONTACT",
            "geography": "BASTAR",
        },
        headers=researcher_headers,
    )
    client.post(
        "/api/v1/market-validation/retention/network/interactions",
        json={
            "actor_type": "TRAVELER",
            "actor_id": "traveler-1",
            "target_type": "DESTINATION",
            "target_id": "chitrakote-falls",
            "interaction_type": "VIEW",
            "geography": "BASTAR",
        },
        headers=researcher_headers,
    )
    client.post(
        "/api/v1/market-validation/retention/network/interactions",
        json={
            "actor_type": "TRAVELER",
            "actor_id": "traveler-2",
            "target_type": "CREATOR",
            "target_id": "creator-1",
            "interaction_type": "FOLLOW",
            "geography": "SURGUJA",
        },
        headers=researcher_headers,
    )

    # 2. Check density metrics
    dens_resp = client.get("/api/v1/market-validation/retention/network/density", headers=researcher_headers)
    assert dens_resp.status_code == 200
    density = dens_resp.json()
    assert density["total_meaningful_interactions"] >= 3
    assert density["total_travelers"] >= 2
    assert density["traveler_to_provider_edges"] >= 1
    assert density["traveler_to_destination_edges"] >= 1

    # 3. Check health score
    health_resp = client.get("/api/v1/market-validation/retention/network/health", headers=researcher_headers)
    assert health_resp.status_code == 200
    health = health_resp.json()
    assert health["network_health_score"] > 0
    assert health["interpretation"] in [
        "ACCELERATING_NETWORK_EFFECTS",
        "DEVELOPING_REGIONAL_ECOSYSTEM",
        "EMERGING_SUPPLY_CONSTRAINED",
        "EARLY_STAGE_SEEDING",
    ]

    # 4. Check regional view
    reg_resp = client.get("/api/v1/market-validation/retention/network/by-region", headers=researcher_headers)
    assert reg_resp.status_code == 200
    regions = reg_resp.json()
    assert len(regions) >= 3
    bastar = next(r for r in regions if r["geography"] == "BASTAR")
    assert bastar["supply_density"] > 0
