import pytest
from app.modules.market_validation.pilot.models import PilotAuditEvent


def test_audit_event_structure():
    audit = PilotAuditEvent(
        pilot_id="pilot-test-001",
        event_type="pilot_status_active",
        actor_id="admin-001",
        actor_role="SCALE_ADMIN",
        details={"from": "READY", "to": "ACTIVE"},
    )
    assert audit.pilot_id == "pilot-test-001"
    assert audit.event_type == "pilot_status_active"
    assert audit.actor_role == "SCALE_ADMIN"
    assert audit.details["to"] == "ACTIVE"
