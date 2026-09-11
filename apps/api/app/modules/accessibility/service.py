from __future__ import annotations

import uuid
from typing import Any
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .models import AccessibilityAudit, AccessibilityIssue
from .rules import (
    RULE_EMPTY_TEXT,
    RULE_GALLERY_ALT_REQUIRED,
    RULE_IMAGE_ALT_REQUIRED,
)


class AccessibilityService:
    def audit_entry(
        self,
        db: Session | None,
        entry: Any,
        template: Any,
        locale_code: str = "en",
        persist: bool = True,
    ) -> dict[str, Any]:
        issues: list[dict[str, Any]] = []

        fields = getattr(template, "fields", []) or []
        entry_values = getattr(entry, "values", {}) or {}

        for field in fields:
            field_key = getattr(field, "key", "")
            field_type = getattr(field, "type", "")
            value = entry_values.get(field_key)

            if field_type == "IMAGE":
                if not value:
                    continue

                alt_text = None
                if isinstance(value, dict):
                    alt_text = value.get("alt_text") or value.get("alt")

                if not alt_text or not str(alt_text).strip():
                    issues.append(
                        {
                            "field_key": field_key,
                            "code": RULE_IMAGE_ALT_REQUIRED.code,
                            "severity": RULE_IMAGE_ALT_REQUIRED.severity,
                            "message": RULE_IMAGE_ALT_REQUIRED.message,
                            "remediation": RULE_IMAGE_ALT_REQUIRED.remediation,
                        }
                    )

            elif field_type == "GALLERY":
                if not value:
                    continue

                if isinstance(value, list):
                    for image in value:
                        alt_text = None
                        if isinstance(image, dict):
                            alt_text = image.get("alt_text") or image.get("alt")

                        if not alt_text or not str(alt_text).strip():
                            issues.append(
                                {
                                    "field_key": field_key,
                                    "code": RULE_GALLERY_ALT_REQUIRED.code,
                                    "severity": RULE_GALLERY_ALT_REQUIRED.severity,
                                    "message": RULE_GALLERY_ALT_REQUIRED.message,
                                    "remediation": RULE_GALLERY_ALT_REQUIRED.remediation,
                                }
                            )

        blocker_count = sum(
            1 for issue in issues if issue["severity"] == "BLOCKER"
        )
        score = max(0, 100 - blocker_count * 20)
        status = "PASS" if blocker_count == 0 else "FAIL"

        entry_id_val = getattr(entry, "id", None)
        audit_record = None

        if persist and db is not None and entry_id_val is not None:
            parsed_entry_id = (
                uuid.UUID(str(entry_id_val))
                if not isinstance(entry_id_val, uuid.UUID)
                else entry_id_val
            )
            audit_record = AccessibilityAudit(
                content_entry_id=parsed_entry_id,
                locale_code=locale_code,
                score=score,
                status=status,
            )
            db.add(audit_record)
            db.flush()

            for issue in issues:
                db.add(
                    AccessibilityIssue(
                        audit_id=audit_record.id,
                        field_key=issue["field_key"],
                        code=issue["code"],
                        severity=issue["severity"],
                        message=issue["message"],
                        remediation=issue["remediation"],
                    )
                )

            db.commit()
            db.refresh(audit_record)

        return {
            "score": score,
            "status": status,
            "issues": issues,
            "content_entry_id": str(entry_id_val) if entry_id_val else "",
            "locale_code": locale_code,
        }

    def get_audit_summary(self, db: Session) -> dict[str, Any]:
        total_audits = db.scalar(select(func.count(AccessibilityAudit.id))) or 0
        blockers = (
            db.scalar(
                select(func.count(AccessibilityIssue.id)).where(
                    AccessibilityIssue.severity == "BLOCKER"
                )
            )
            or 0
        )
        avg_score_raw = db.scalar(select(func.avg(AccessibilityAudit.score)))
        avg_score = round(float(avg_score_raw), 1) if avg_score_raw is not None else 100.0

        audits = list(
            db.scalars(
                select(AccessibilityAudit)
                .order_by(AccessibilityAudit.created_at.desc())
                .limit(50)
            )
        )

        return {
            "total": total_audits,
            "blockers": blockers,
            "average_score": avg_score,
            "items": [
                {
                    "id": a.id,
                    "content_entry_id": str(a.content_entry_id),
                    "locale_code": a.locale_code,
                    "score": a.score,
                    "status": a.status,
                    "created_at": a.created_at.isoformat() if a.created_at else None,
                    "issue_count": len(a.issues) if a.issues else 0,
                }
                for a in audits
            ],
        }

    def get_entry_audit(
        self,
        db: Session,
        entry_id: uuid.UUID | str,
    ) -> AccessibilityAudit | None:
        parsed_entry_id = (
            uuid.UUID(str(entry_id))
            if not isinstance(entry_id, uuid.UUID)
            else entry_id
        )
        return db.scalar(
            select(AccessibilityAudit)
            .where(AccessibilityAudit.content_entry_id == parsed_entry_id)
            .order_by(AccessibilityAudit.created_at.desc())
        )
