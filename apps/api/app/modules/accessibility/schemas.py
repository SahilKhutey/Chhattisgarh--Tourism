from __future__ import annotations

from pydantic import BaseModel


class AccessibilityIssueResponse(BaseModel):
    field_key: str | None
    code: str
    severity: str
    message: str
    remediation: str | None


class AccessibilityAuditResponse(BaseModel):
    content_entry_id: str
    locale_code: str
    score: int
    status: str
    issues: list[AccessibilityIssueResponse]
