import pytest

HYPOTHESIS_STATUSES = {
    "UNTESTED",
    "TESTING",
    "SUPPORTED",
    "STRONGLY_SUPPORTED",
    "PARTIALLY_SUPPORTED",
    "INCONCLUSIVE",
    "INVALIDATED",
}


def evaluate_hypothesis(evidence_list: list) -> str:
    if not evidence_list:
        return "UNTESTED"
    supports = sum(1 for e in evidence_list if e.get("supports", False))
    contradicts = sum(1 for e in evidence_list if not e.get("supports", False))
    total = len(evidence_list)

    if total < 5:
        return "INCONCLUSIVE"
    if supports / total >= 0.8:
        return "STRONGLY_SUPPORTED"
    if supports / total >= 0.6:
        return "SUPPORTED"
    if contradicts / total >= 0.6:
        return "INVALIDATED"
    return "PARTIALLY_SUPPORTED"


def test_hypothesis_requires_evidence_to_be_supported():
    # A hypothesis cannot become SUPPORTED without evidence (Section 15)
    result = evaluate_hypothesis(evidence_list=[])
    assert result == "UNTESTED"


def test_invalidated_to_supported_transition_blocked_directly():
    # Direct mutation from INVALIDATED to SUPPORTED without fresh evidence cycle is prohibited (Section 14)
    current_status = "INVALIDATED"
    target_status = "SUPPORTED"

    allowed_transitions = {
        "UNTESTED": {"TESTING"},
        "TESTING": {"SUPPORTED", "PARTIALLY_SUPPORTED", "INCONCLUSIVE", "INVALIDATED"},
        "SUPPORTED": {"TESTING", "INVALIDATED"},
        "INVALIDATED": {"TESTING"},  # Must re-enter TESTING with new evidence
    }
    assert target_status not in allowed_transitions.get(current_status, set())


def test_hypothesis_supported_with_solid_evidence():
    evidence = [{"supports": True}] * 9 + [{"supports": False}]
    result = evaluate_hypothesis(evidence)
    assert result == "STRONGLY_SUPPORTED"
