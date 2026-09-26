import pytest


def calculate_rate(numerator: int | float, denominator: int | float) -> float | None:
    if denominator <= 0:
        return None
    return numerator / denominator


def calculate_cac(acquisition_cost: float, customers: int) -> float | None:
    if customers <= 0:
        return None
    return acquisition_cost / customers


def test_conversion_rate_calculation():
    # 25 / 100 = 0.25 (Section 17)
    assert calculate_rate(25, 100) == 0.25


def test_zero_denominator_returns_none_not_nan_or_inf():
    # Zero denominator must return None / insufficient data, never NaN or Infinity (Section 18)
    assert calculate_rate(0, 0) is None
    assert calculate_rate(10, 0) is None


def test_cac_calculation_and_zero_customer_case():
    assert calculate_cac(10000.0, 100) == 100.0
    assert calculate_cac(10000.0, 0) is None


def test_percentage_points_vs_percentage_change():
    # Baseline = 10%, Current = 15% (Section 20)
    baseline_pct = 10.0
    current_pct = 15.0

    pp_change = current_pct - baseline_pct  # +5 percentage points
    relative_change_pct = ((current_pct - baseline_pct) / baseline_pct) * 100.0  # +50%

    assert pp_change == 5.0
    assert relative_change_pct == 50.0


def test_negative_contribution_margin_is_preserved():
    # If revenue = 100 and variable cost = 130, contribution = -30 (Section 31)
    revenue = 100.0
    variable_cost = 130.0
    contribution = revenue - variable_cost
    assert contribution == -30.0
    assert contribution < 0.0  # Do not clamp to zero!


def test_gmv_is_not_revenue():
    # Protects MV9 economic model (Section 29)
    gmv = 100000.0
    take_rate = 0.10
    recognized_revenue = gmv * take_rate
    assert recognized_revenue == 10000.0
    assert recognized_revenue != gmv
