import pytest


def determine_validation_decision(
    safety_pass: bool,
    consumer_problem_valid: bool,
    evidence_complete: bool,
    economics_viable: bool,
    all_gates_pass: bool,
    traffic_high: bool = False,
    activation_low: bool = False,
) -> str:
    # 1. Critical safety failure -> NO_GO (Section 22)
    if not safety_pass:
        return "NO_GO"

    # 2. False-positive traffic guard: Traffic must NEVER substitute for validation (Section 26)
    if traffic_high and activation_low:
        return "CONTINUE_VALIDATION"

    # 3. Core consumer problem not valid -> PIVOT
    if not consumer_problem_valid:
        return "PIVOT"

    # 4. Incomplete evidence -> CONTINUE_VALIDATION / INCONCLUSIVE
    if not evidence_complete:
        return "INCONCLUSIVE"

    # 5. Economics unviable -> CONDITIONAL_GO (Section 23)
    if not economics_viable:
        return "CONDITIONAL_GO"

    # 6. All required gates pass -> GO
    if all_gates_pass:
        return "GO"

    return "CONTINUE_VALIDATION"


def test_safety_failure_forces_no_go():
    decision = determine_validation_decision(
        safety_pass=False,
        consumer_problem_valid=True,
        evidence_complete=True,
        economics_viable=True,
        all_gates_pass=True,
    )
    assert decision == "NO_GO"


def test_false_positive_traffic_prevention():
    # High traffic + low activation must not yield GO (Section 26)
    decision = determine_validation_decision(
        safety_pass=True,
        consumer_problem_valid=True,
        evidence_complete=True,
        economics_viable=True,
        all_gates_pass=True,
        traffic_high=True,
        activation_low=True,
    )
    assert decision != "GO"
    assert decision == "CONTINUE_VALIDATION"


def test_economic_gate_yields_conditional_go():
    decision = determine_validation_decision(
        safety_pass=True,
        consumer_problem_valid=True,
        evidence_complete=True,
        economics_viable=False,
        all_gates_pass=True,
    )
    assert decision == "CONDITIONAL_GO"


def test_incomplete_evidence_yields_inconclusive():
    decision = determine_validation_decision(
        safety_pass=True,
        consumer_problem_valid=True,
        evidence_complete=False,
        economics_viable=True,
        all_gates_pass=True,
    )
    assert decision == "INCONCLUSIVE"


def test_all_pass_yields_go():
    decision = determine_validation_decision(
        safety_pass=True,
        consumer_problem_valid=True,
        evidence_complete=True,
        economics_viable=True,
        all_gates_pass=True,
    )
    assert decision == "GO"
