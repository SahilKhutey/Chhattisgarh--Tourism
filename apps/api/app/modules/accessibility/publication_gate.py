from __future__ import annotations

from typing import Any


class AccessibilityPublicationError(Exception):
    def __init__(self, message: str, issues: list[dict[str, Any]] | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.issues = issues or []


def enforce_accessibility_gate(audit: dict[str, Any]) -> None:
    if audit.get("status") != "PASS":
        blockers = [
            issue
            for issue in audit.get("issues", [])
            if issue.get("severity") == "BLOCKER"
        ]
        raise AccessibilityPublicationError(
            "Content cannot be published until blocking accessibility issues are resolved.",
            issues=blockers,
        )
