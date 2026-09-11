import pytest

from app.modules.accessibility.publication_gate import (
    AccessibilityPublicationError,
    enforce_accessibility_gate,
)


def test_enforce_accessibility_gate_passes_on_pass():
    audit = {
        "status": "PASS",
        "score": 100,
        "issues": [],
    }
    enforce_accessibility_gate(audit)


def test_enforce_accessibility_gate_raises_on_fail():
    audit = {
        "status": "FAIL",
        "score": 80,
        "issues": [
            {
                "field_key": "hero",
                "code": "IMAGE_ALT_REQUIRED",
                "severity": "BLOCKER",
            }
        ],
    }
    with pytest.raises(AccessibilityPublicationError) as exc_info:
        enforce_accessibility_gate(audit)

    assert "blocking accessibility issues" in str(exc_info.value)
    assert len(exc_info.value.issues) == 1
