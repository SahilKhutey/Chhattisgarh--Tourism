import pytest

# Evidence strength hierarchy (Section 8)
STRENGTH_LEVELS = {
    "WEAK": 1,
    "MODERATE": 2,
    "STRONG": 3,
    "VERY_STRONG": 4,
}


def test_evidence_strength_ordering():
    assert STRENGTH_LEVELS["WEAK"] < STRENGTH_LEVELS["MODERATE"]
    assert STRENGTH_LEVELS["MODERATE"] < STRENGTH_LEVELS["STRONG"]
    assert STRENGTH_LEVELS["STRONG"] < STRENGTH_LEVELS["VERY_STRONG"]


def test_negative_evidence_is_preserved():
    # Negative evidence must never be silently discarded (Section 7)
    evidence_records = [
        {"id": "ev-01", "supporting": True, "observation": "Liked destination cards"},
        {"id": "ev-02", "supporting": False, "observation": "Abandoned planning due to safety doubt"},
    ]
    negative_evidence = [e for e in evidence_records if not e["supporting"]]
    assert len(negative_evidence) == 1
    assert negative_evidence[0]["observation"] == "Abandoned planning due to safety doubt"


def test_contradictory_evidence_yields_inconclusive():
    # If positive = 8 and negative = 7, conclusion must be INCONCLUSIVE, not SUPPORTED (Section 10)
    positives = 8
    negatives = 7
    total = positives + negatives

    net_support_ratio = (positives - negatives) / total
    # Net support ratio is only ~0.066, well below 0.50 threshold for support
    status = "SUPPORTED" if net_support_ratio >= 0.50 else "INCONCLUSIVE"
    assert status == "INCONCLUSIVE"


def test_sample_size_guard_returns_insufficient_data():
    sample = 2
    minimum = 20
    status = "VALIDATED" if sample >= minimum else "INSUFFICIENT_DATA"
    assert status == "INSUFFICIENT_DATA"
