def test_expansion_candidates_ranking(client):
    resp = client.get("/api/v1/market-validation/expansion?current_market=Bastar")
    assert resp.status_code == 200
    candidates = resp.json()
    assert len(candidates) == 3
    # Surguja is first expansion candidate due to high similarity and fit
    assert candidates[0]["candidate_market_id"] == "Surguja"
    assert candidates[0]["recommendation"] == "RECOMMENDED_NEXT_EXPANSION"
    assert candidates[0]["composite_expansion_score"] > 60.0
