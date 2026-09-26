import pytest
from app.modules.market_validation.pilot.schemas import PILOT_TRANSITIONS


def test_complete_state_machine_graph():
    # Verify strict deterministic state transitions
    valid_path = ["DRAFT", "DESIGNED", "APPROVED", "READY", "ACTIVE", "COMPLETED", "PROMOTED"]

    for i in range(len(valid_path) - 1):
        curr = valid_path[i]
        nxt = valid_path[i + 1]
        assert nxt in PILOT_TRANSITIONS[curr], f"Expected {nxt} to be valid from {curr}"


def test_terminal_states_have_no_further_transitions():
    assert len(PILOT_TRANSITIONS["FAILED"]) == 0
    assert len(PILOT_TRANSITIONS["PROMOTED"]) == 0
    assert len(PILOT_TRANSITIONS["CANCELLED"]) == 0
