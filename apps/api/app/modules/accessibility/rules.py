from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AccessibilityRule:
    code: str
    severity: str
    message: str
    remediation: str


RULE_IMAGE_ALT_REQUIRED = AccessibilityRule(
    code="IMAGE_ALT_REQUIRED",
    severity="BLOCKER",
    message="Image requires alternative text.",
    remediation="Provide meaningful alternative text.",
)

RULE_GALLERY_ALT_REQUIRED = AccessibilityRule(
    code="GALLERY_ALT_REQUIRED",
    severity="BLOCKER",
    message="Every gallery image requires alternative text.",
    remediation="Provide alternative text for every gallery image.",
)

RULE_EMPTY_TEXT = AccessibilityRule(
    code="EMPTY_TEXT",
    severity="WARNING",
    message="Text content is empty.",
    remediation="Provide meaningful content.",
)
