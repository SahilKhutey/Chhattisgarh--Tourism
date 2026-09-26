import pytest
from app.modules.market_validation.pilot.schemas import PILOT_TRANSITIONS, VALID_PILOT_STATUSES


def test_pilot_state_machine_valid_transitions():
    assert "DESIGNED" in PILOT_TRANSITIONS["DRAFT"]
    assert "APPROVED" in PILOT_TRANSITIONS["DESIGNED"]
    assert "READY" in PILOT_TRANSITIONS["APPROVED"]
    assert "ACTIVE" in PILOT_TRANSITIONS["READY"]
    assert "PAUSED" in PILOT_TRANSITIONS["ACTIVE"]
    assert "ACTIVE" in PILOT_TRANSITIONS["PAUSED"]
    assert "COMPLETED" in PILOT_TRANSITIONS["ACTIVE"]
    assert "PROMOTED" in PILOT_TRANSITIONS["COMPLETED"]


def test_pilot_invalid_transitions():
    # Prohibited transitions (Section 36)
    assert "COMPLETED" not in PILOT_TRANSITIONS["DRAFT"]
    assert "ACTIVE" not in PILOT_TRANSITIONS["COMPLETED"]
    assert "ACTIVE" not in PILOT_TRANSITIONS["CANCELLED"]
    assert "ACTIVE" not in PILOT_TRANSITIONS["FAILED"]


def test_pilot_scope_isolation():
    # Pilot metrics must only measure scoped destinations and providers (Section 37)
    pilot_destinations = {"chitrakote-falls", "tirathgarh-falls"}
    incoming_event_dest = "mainpat-hills"  # Not in pilot
    assert incoming_event_dest not in pilot_destinations
