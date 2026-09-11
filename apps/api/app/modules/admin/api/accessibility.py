from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import (
    AdminUser,
    require_accessibility_read,
    require_accessibility_write,
)
from app.modules.accessibility.schemas import (
    AccessibilityAuditResponse,
    AccessibilityIssueResponse,
)
from app.modules.accessibility.service import AccessibilityService
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_template.models.template_version import TemplateVersion

router = APIRouter(
    prefix="/admin/accessibility",
    tags=["admin-accessibility"],
)

service = AccessibilityService()


@router.get(
    "/audit",
)
def accessibility_audit(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_accessibility_read),
) -> dict[str, Any]:
    return service.get_audit_summary(db)


@router.post(
    "/entries/{entry_id}/audit",
    response_model=AccessibilityAuditResponse,
)
def run_accessibility_audit(
    entry_id: str,
    locale: str = Query(default="en"),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_accessibility_write),
) -> AccessibilityAuditResponse:
    try:
        eid = uuid.UUID(str(entry_id))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content entry not found.",
        )

    entry = db.scalar(select(ContentEntry).where(ContentEntry.id == eid))
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content entry not found.",
        )

    version = db.scalar(
        select(TemplateVersion).where(
            TemplateVersion.id == entry.template_version_id
        )
    )
    if version is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template version not found.",
        )

    result = service.audit_entry(
        db=db,
        entry=entry,
        template=version,
        locale_code=locale,
        persist=True,
    )

    issues = [
        AccessibilityIssueResponse(
            field_key=issue["field_key"],
            code=issue["code"],
            severity=issue["severity"],
            message=issue["message"],
            remediation=issue["remediation"],
        )
        for issue in result["issues"]
    ]

    return AccessibilityAuditResponse(
        content_entry_id=str(entry.id),
        locale_code=locale,
        score=result["score"],
        status=result["status"],
        issues=issues,
    )


@router.get(
    "/entries/{entry_id}",
    response_model=AccessibilityAuditResponse,
)
def get_entry_audit(
    entry_id: str,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_accessibility_read),
) -> AccessibilityAuditResponse:
    try:
        eid = uuid.UUID(str(entry_id))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content entry not found.",
        )

    audit = service.get_entry_audit(db, eid)
    if audit is None:
        # Run audit on-the-fly if none exists
        entry = db.scalar(select(ContentEntry).where(ContentEntry.id == eid))
        if entry is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content entry not found.",
            )
        version = db.scalar(
            select(TemplateVersion).where(
                TemplateVersion.id == entry.template_version_id
            )
        )
        if version is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template version not found.",
            )
        res = service.audit_entry(db, entry, version, locale_code="en", persist=True)
        return AccessibilityAuditResponse(
            content_entry_id=str(entry.id),
            locale_code="en",
            score=res["score"],
            status=res["status"],
            issues=[AccessibilityIssueResponse(**iss) for iss in res["issues"]],
        )

    issues = [
        AccessibilityIssueResponse(
            field_key=issue.field_key,
            code=issue.code,
            severity=issue.severity,
            message=issue.message,
            remediation=issue.remediation,
        )
        for issue in (audit.issues or [])
    ]

    return AccessibilityAuditResponse(
        content_entry_id=str(audit.content_entry_id),
        locale_code=audit.locale_code,
        score=audit.score,
        status=audit.status,
        issues=issues,
    )


@router.patch(
    "/entries/{entry_id}/fields/{field_key}",
)
def remediate_accessibility_field(
    entry_id: str,
    field_key: str,
    payload: dict[str, Any],
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_accessibility_write),
) -> dict[str, Any]:
    try:
        eid = uuid.UUID(str(entry_id))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content entry not found.",
        )

    entry = db.scalar(select(ContentEntry).where(ContentEntry.id == eid))
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content entry not found.",
        )

    values = dict(entry.values or {})
    current_val = values.get(field_key)

    alt_text = payload.get("alt_text") or payload.get("alt")
    if isinstance(current_val, dict):
        current_val["alt_text"] = alt_text
        current_val["alt"] = alt_text
        values[field_key] = current_val
    elif isinstance(current_val, list):
        # Gallery update
        index = payload.get("index", 0)
        if 0 <= index < len(current_val) and isinstance(current_val[index], dict):
            current_val[index]["alt_text"] = alt_text
            current_val[index]["alt"] = alt_text
            values[field_key] = current_val
    elif alt_text:
        values[field_key] = {"url": str(current_val or ""), "alt_text": alt_text, "alt": alt_text}

    entry.values = values
    entry.revision += 1
    db.commit()
    db.refresh(entry)

    return {
        "success": True,
        "entry_id": str(entry.id),
        "field_key": field_key,
        "revision": entry.revision,
    }
