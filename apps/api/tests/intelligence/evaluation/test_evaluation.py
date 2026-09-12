from __future__ import annotations

from app.modules.intelligence.evaluation.metrics import (
    ndcg_at_k,
    precision_at_k,
    recall_at_k,
    reciprocal_rank,
)


def test_precision_at_k():
    predicted = ["doc1", "doc2", "doc3", "doc4", "doc5"]
    relevant = {"doc1", "doc3"}

    assert precision_at_k(predicted, relevant, k=5) == 2 / 5
    assert precision_at_k(predicted, relevant, k=2) == 1 / 2
    assert precision_at_k([], relevant, k=5) == 0.0


def test_reciprocal_rank():
    assert reciprocal_rank(["doc1", "doc2"], {"doc1"}) == 1.0
    assert reciprocal_rank(["doc2", "doc1"], {"doc1"}) == 0.5
    assert reciprocal_rank(["doc3", "doc4", "doc1"], {"doc1"}) == 1 / 3
    assert reciprocal_rank(["doc3", "doc4"], {"doc1"}) == 0.0


def test_recall_at_k():
    predicted = ["doc1", "doc2", "doc3"]
    relevant = {"doc1", "doc3", "doc5"}

    assert recall_at_k(predicted, relevant, k=3) == 2 / 3
    assert recall_at_k(predicted, set(), k=3) == 1.0


def test_ndcg_at_k():
    # Ideal ranking (relevant items at position 1 and 2)
    predicted_ideal = ["doc1", "doc2", "doc3"]
    relevant = {"doc1", "doc2"}
    assert ndcg_at_k(predicted_ideal, relevant, k=3) == 1.0

    # Suboptimal ranking
    predicted_sub = ["doc3", "doc1", "doc2"]
    ndcg = ndcg_at_k(predicted_sub, relevant, k=3)
    assert 0.0 < ndcg < 1.0
