from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class FieldChange:
    key: str
    change: str
    breaking: bool
    before: Any = None
    after: Any = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "key": self.key,
            "change": self.change,
            "breaking": self.breaking,
            "before": self.before,
            "after": self.after,
        }


@dataclass
class VersionDiff:
    added: list[FieldChange] = field(default_factory=list)
    removed: list[FieldChange] = field(default_factory=list)
    changed: list[FieldChange] = field(default_factory=list)
    reordered: list[FieldChange] = field(default_factory=list)
    metadata_changes: list[dict[str, Any]] = field(default_factory=list)
    breaking: bool = False


def serialize_field(f: Any) -> dict[str, Any]:
    return {
        "key": f.key,
        "label": f.label,
        "type": getattr(f, "type", getattr(f, "field_type", None)),
        "required": f.required,
        "translatable": f.translatable,
        "order": f.order,
        "group": getattr(f, "group", getattr(f, "group_name", None)),
        "helpText": f.help_text,
        "config": f.config or {},
    }


def compare_versions(before: Any, after: Any) -> VersionDiff:
    result = VersionDiff()

    before_fields = {f.key: f for f in before.fields}
    after_fields = {f.key: f for f in after.fields}

    before_keys = set(before_fields.keys())
    after_keys = set(after_fields.keys())

    for key in sorted(after_keys - before_keys):
        field_obj = after_fields[key]
        is_breaking = bool(field_obj.required)
        if is_breaking:
            result.breaking = True

        result.added.append(
            FieldChange(
                key=key,
                change="ADDED",
                breaking=is_breaking,
                after=serialize_field(field_obj),
            )
        )

    for key in sorted(before_keys - after_keys):
        field_obj = before_fields[key]
        result.removed.append(
            FieldChange(
                key=key,
                change="REMOVED",
                breaking=True,
                before=serialize_field(field_obj),
            )
        )
        result.breaking = True

    for key in sorted(before_keys & after_keys):
        old = before_fields[key]
        new = after_fields[key]

        old_type = getattr(old, "type", getattr(old, "field_type", None))
        new_type = getattr(new, "type", getattr(new, "field_type", None))

        if old_type != new_type:
            result.changed.append(
                FieldChange(
                    key=key,
                    change="TYPE_CHANGED",
                    breaking=True,
                    before=old_type,
                    after=new_type,
                )
            )
            result.breaking = True

        if not old.required and new.required:
            result.changed.append(
                FieldChange(
                    key=key,
                    change="REQUIRED_ADDED",
                    breaking=True,
                    before=False,
                    after=True,
                )
            )
            result.breaking = True

        if old.required and not new.required:
            result.changed.append(
                FieldChange(
                    key=key,
                    change="REQUIRED_REMOVED",
                    breaking=False,
                    before=True,
                    after=False,
                )
            )

        if old.translatable != new.translatable:
            result.changed.append(
                FieldChange(
                    key=key,
                    change="TRANSLATABILITY_CHANGED",
                    breaking=False,
                    before=old.translatable,
                    after=new.translatable,
                )
            )

        if (old.config or {}) != (new.config or {}):
            result.changed.append(
                FieldChange(
                    key=key,
                    change="CONFIG_CHANGED",
                    breaking=True,
                    before=old.config or {},
                    after=new.config or {},
                )
            )
            result.breaking = True

        if old.order != new.order:
            result.reordered.append(
                FieldChange(
                    key=key,
                    change="ORDER_CHANGED",
                    breaking=False,
                    before=old.order,
                    after=new.order,
                )
            )

        old_group = getattr(old, "group", getattr(old, "group_name", None))
        new_group = getattr(new, "group", getattr(new, "group_name", None))
        if old_group != new_group:
            result.changed.append(
                FieldChange(
                    key=key,
                    change="GROUP_CHANGED",
                    breaking=False,
                    before=old_group,
                    after=new_group,
                )
            )

        if old.label != new.label:
            result.changed.append(
                FieldChange(
                    key=key,
                    change="LABEL_CHANGED",
                    breaking=False,
                    before=old.label,
                    after=new.label,
                )
            )

        if old.help_text != new.help_text:
            result.changed.append(
                FieldChange(
                    key=key,
                    change="HELP_TEXT_CHANGED",
                    breaking=False,
                    before=old.help_text,
                    after=new.help_text,
                )
            )

    metadata_pairs = [
        ("name", before.name, after.name),
        ("slug", before.slug, after.slug),
        ("description", before.description, after.description),
        ("icon", before.icon, after.icon),
        ("category", before.category, after.category),
    ]

    for name, old_val, new_val in metadata_pairs:
        if old_val != new_val:
            result.metadata_changes.append(
                {
                    "field": name,
                    "before": old_val,
                    "after": new_val,
                }
            )

    return result


def summarize_diff(diff: VersionDiff) -> dict[str, Any]:
    high_risk = (
        len(diff.removed)
        + sum(1 for change in diff.changed if change.breaking)
        + sum(1 for change in diff.added if change.breaking)
    )

    if high_risk:
        risk_level = "HIGH"
    elif any(
        change.change in {"CONFIG_CHANGED", "TRANSLATABILITY_CHANGED"}
        for change in diff.changed
    ):
        risk_level = "MEDIUM"
    elif diff.changed or diff.added:
        risk_level = "LOW"
    else:
        risk_level = "LOW"

    actions: list[dict[str, str]] = []
    if diff.breaking:
        actions.append(
            {
                "type": "MANUAL_REVIEW",
                "reason": "Breaking schema changes require compatibility review.",
            }
        )

    return {
        "breaking": diff.breaking,
        "added": len(diff.added),
        "removed": len(diff.removed),
        "changed": len(diff.changed),
        "reordered": len(diff.reordered),
        "risk_level": risk_level,
        "actions": actions,
    }
