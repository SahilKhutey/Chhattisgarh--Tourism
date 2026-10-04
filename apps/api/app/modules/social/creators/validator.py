from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True, slots=True)
class ValidationIssue:
    field: str
    code: str
    message: str


@dataclass(frozen=True, slots=True)
class ValidationResult:
    valid: bool
    issues: tuple[ValidationIssue, ...]

    @classmethod
    def from_issues(
        cls,
        issues: list[ValidationIssue],
    ) -> "ValidationResult":
        return cls(
            valid=not issues,
            issues=tuple(issues),
        )


class CreatorValidator:
    MAX_NAME_LENGTH = 120
    MAX_BIO_LENGTH = 1000

    def validate(
        self,
        target: Any = None,
        *,
        display_name: str | None = None,
        slug: str | None = None,
        bio: str | None = None,
        district_id: UUID | str | None = None,
        tourism_zone_id: UUID | str | None = None,
        tourism_zone: UUID | str | None = None,
    ) -> ValidationResult:
        issues: list[ValidationIssue] = []

        if target is not None:
            if isinstance(target, dict):
                display_name = target.get("display_name", display_name)
                slug = target.get("slug", target.get("handle", slug))
                bio = target.get("bio", bio)
                district_id = target.get("district_id", district_id)
                tourism_zone_id = target.get("tourism_zone_id", target.get("tourism_zone", tourism_zone_id))
            else:
                display_name = getattr(target, "display_name", display_name)
                slug = getattr(target, "slug", getattr(target, "handle", slug))
                bio = getattr(target, "bio", bio)
                district_id = getattr(target, "district_id", district_id)
                tourism_zone_id = getattr(target, "tourism_zone_id", getattr(target, "tourism_zone", tourism_zone_id))

        if tourism_zone and not tourism_zone_id:
            tourism_zone_id = tourism_zone

        name = (display_name or "").strip()

        if not name:
            issues.append(
                ValidationIssue(
                    field="display_name",
                    code="REQUIRED",
                    message="Creator display name is required.",
                )
            )
        elif len(name) > self.MAX_NAME_LENGTH:
            issues.append(
                ValidationIssue(
                    field="display_name",
                    code="TOO_LONG",
                    message=f"Creator display name exceeds {self.MAX_NAME_LENGTH} characters.",
                )
            )

        normalized_slug = (slug or "").strip().lower()

        if not normalized_slug:
            issues.append(
                ValidationIssue(
                    field="slug",
                    code="REQUIRED",
                    message="Creator slug is required.",
                )
            )

        if bio and len(bio.strip()) > self.MAX_BIO_LENGTH:
            issues.append(
                ValidationIssue(
                    field="bio",
                    code="TOO_LONG",
                    message=f"Creator bio exceeds {self.MAX_BIO_LENGTH} characters.",
                )
            )

        if tourism_zone_id and not district_id:
            issues.append(
                ValidationIssue(
                    field="district_id",
                    code="DISTRICT_REQUIRED",
                    message="A tourism zone requires an associated district.",
                )
            )

        return ValidationResult.from_issues(issues)


__all__ = ["ValidationIssue", "ValidationResult", "CreatorValidator"]
