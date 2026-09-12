from __future__ import annotations

import math


def precision_at_k(
    predicted: list[str],
    relevant: set[str],
    k: int,
) -> float:
    """Calculates Precision@K for a retrieved list of identifiers against relevant set."""
    top = predicted[:k]
    if not top:
        return 0.0

    hits = sum(1 for item in top if item in relevant)
    return hits / len(top)


def reciprocal_rank(
    predicted: list[str],
    relevant: set[str],
) -> float:
    """Calculates Mean Reciprocal Rank (MRR) - 1/rank of the first relevant result."""
    for index, item in enumerate(predicted, start=1):
        if item in relevant:
            return 1.0 / index
    return 0.0


def recall_at_k(
    predicted: list[str],
    relevant: set[str],
    k: int,
) -> float:
    """Calculates Recall@K."""
    if not relevant:
        return 1.0
    top = set(predicted[:k])
    hits = sum(1 for item in top if item in relevant)
    return hits / len(relevant)


def ndcg_at_k(
    predicted: list[str],
    relevant: set[str],
    k: int,
) -> float:
    """Calculates Normalized Discounted Cumulative Gain at K (binary relevance)."""
    top = predicted[:k]
    if not top or not relevant:
        return 0.0

    dcg = 0.0
    for i, item in enumerate(top, start=1):
        if item in relevant:
            dcg += 1.0 / math.log2(i + 1)

    # Ideal DCG
    idcg = sum(1.0 / math.log2(i + 1) for i in range(1, min(len(relevant), k) + 1))
    if idcg == 0.0:
        return 0.0

    return dcg / idcg
