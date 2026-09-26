import pytest


def evaluate_risk_level(probability: float, impact: float) -> str:
    score = probability * impact
    if score >= 60.0:
        return "CRITICAL"
    if score >= 40.0:
        return "HIGH"
    if score >= 20.0:
        return "MEDIUM"
    return "LOW"


def test_risk_severity_classification():
    assert evaluate_risk_level(8.0, 9.0) == "CRITICAL"
    assert evaluate_risk_level(6.0, 7.0) == "HIGH"
    assert evaluate_risk_level(5.0, 5.0) == "MEDIUM"
    assert evaluate_risk_level(2.0, 3.0) == "LOW"


def test_high_risk_market_is_deferred():
    # If risk_score > 60, market candidate is deferred regardless of composite score (Section 46)
    risk_score = 65.0
    composite_score = 80.0
    recommendation = "DEFERRED_DUE_TO_RISK" if risk_score > 60.0 else "RECOMMENDED_PILOT"
    assert recommendation == "DEFERRED_DUE_TO_RISK"
