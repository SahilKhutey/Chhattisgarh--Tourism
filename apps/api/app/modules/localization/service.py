from __future__ import annotations

import uuid
from typing import Any
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_template.models.template import ContentTemplate
from app.modules.content_template.models.template_version import TemplateVersion

from .completeness import calculate_completeness
from .content_models import ContentLocalization, TemplateLocalization
from .models import Locale


class FieldNotTranslatableError(Exception):
    def __init__(self, field_key: str, message: str | None = None) -> None:
        self.field_key = field_key
        self.message = message or f"Field '{field_key}' is not translatable."
        super().__init__(self.message)


class LocalizationService:
    def get_locales(self, db: Session) -> list[Locale]:
        return list(
            db.scalars(
                select(Locale)
                .where(Locale.enabled.is_(True))
                .order_by(Locale.code)
            )
        )

    def get_locale_by_code(self, db: Session, code: str) -> Locale | None:
        return db.scalar(
            select(Locale).where(
                Locale.code == code,
                Locale.enabled.is_(True),
            )
        )

    def upsert_template_localization(
        self,
        db: Session,
        template_id: uuid.UUID | str,
        locale_code: str,
        name: str | None,
        description: str | None,
    ) -> TemplateLocalization:
        parsed_template_id = (
            uuid.UUID(str(template_id))
            if not isinstance(template_id, uuid.UUID)
            else template_id
        )

        template = db.scalar(
            select(ContentTemplate).where(ContentTemplate.id == parsed_template_id)
        )
        if template is None:
            raise ValueError(f"Template '{template_id}' not found.")

        locale = self.get_locale_by_code(db, locale_code)
        if locale is None:
            raise ValueError(f"Unsupported locale: {locale_code}")

        localization = db.scalar(
            select(TemplateLocalization).where(
                TemplateLocalization.template_id == parsed_template_id,
                TemplateLocalization.locale_code == locale_code,
            )
        )

        if localization is None:
            localization = TemplateLocalization(
                template_id=parsed_template_id,
                locale_code=locale_code,
            )
            db.add(localization)

        localization.name = name
        localization.description = description
        localization.status = "TRANSLATED" if (name or description) else "DRAFT"

        db.commit()
        db.refresh(localization)
        return localization

    def get_template_localization(
        self,
        db: Session,
        template_id: uuid.UUID | str,
        locale_code: str,
    ) -> TemplateLocalization | None:
        parsed_template_id = (
            uuid.UUID(str(template_id))
            if not isinstance(template_id, uuid.UUID)
            else template_id
        )
        return db.scalar(
            select(TemplateLocalization).where(
                TemplateLocalization.template_id == parsed_template_id,
                TemplateLocalization.locale_code == locale_code,
            )
        )

    def get_template_localizations(
        self,
        db: Session,
        template_id: uuid.UUID | str,
    ) -> list[TemplateLocalization]:
        parsed_template_id = (
            uuid.UUID(str(template_id))
            if not isinstance(template_id, uuid.UUID)
            else template_id
        )
        return list(
            db.scalars(
                select(TemplateLocalization)
                .where(TemplateLocalization.template_id == parsed_template_id)
                .order_by(TemplateLocalization.locale_code)
            )
        )

    def get_template_completeness(
        self,
        db: Session,
        template_id: uuid.UUID | str,
        locale_code: str,
    ) -> dict[str, Any]:
        parsed_template_id = (
            uuid.UUID(str(template_id))
            if not isinstance(template_id, uuid.UUID)
            else template_id
        )
        template = db.scalar(
            select(ContentTemplate).where(ContentTemplate.id == parsed_template_id)
        )
        if template is None:
            raise ValueError(f"Template '{template_id}' not found.")

        # If template has published version, use its fields; else draft fields
        fields: list[Any] = []
        if template.published_version_id:
            version = db.scalar(
                select(TemplateVersion).where(
                    TemplateVersion.id == template.published_version_id
                )
            )
            if version and version.fields:
                fields = version.fields
        elif template.fields:
            fields = template.fields

        # Check content localizations or template localization
        trans_records = self.get_template_localizations(db, parsed_template_id)
        # Convert template localization into completeness metric
        loc_record = next((r for r in trans_records if r.locale_code == locale_code), None)
        has_name = bool(loc_record and loc_record.name and loc_record.name.strip())
        
        # Calculate for template-level fields (name, description)
        total = 1 if template.name else 0
        translated = 1 if has_name else 0
        pct = (translated / total * 100.0) if total > 0 else 100.0

        return {
            "locale_code": locale_code,
            "total_fields": total,
            "translated_fields": translated,
            "percentage": round(pct, 2),
            "complete": translated == total,
        }

    def update_content_field_translation(
        self,
        db: Session,
        entry_id: uuid.UUID | str,
        field_key: str,
        locale_code: str,
        value: str | None,
    ) -> ContentLocalization:
        parsed_entry_id = (
            uuid.UUID(str(entry_id))
            if not isinstance(entry_id, uuid.UUID)
            else entry_id
        )

        entry = db.scalar(
            select(ContentEntry).where(ContentEntry.id == parsed_entry_id)
        )
        if entry is None:
            raise ValueError(f"Content entry '{entry_id}' not found.")

        locale = self.get_locale_by_code(db, locale_code)
        if locale is None:
            raise ValueError(f"Unsupported locale: {locale_code}")

        # Validate bound template version
        version = db.scalar(
            select(TemplateVersion).where(
                TemplateVersion.id == entry.template_version_id
            )
        )
        if version is None:
            raise ValueError(
                f"Bound template version '{entry.template_version_id}' not found."
            )

        # Check field exists and translatable
        field = next((f for f in version.fields if f.key == field_key), None)
        if field is None:
            raise ValueError(f"Field '{field_key}' not found in template version.")

        if not getattr(field, "translatable", False):
            raise FieldNotTranslatableError(field_key=field_key)

        loc = db.scalar(
            select(ContentLocalization).where(
                ContentLocalization.content_entry_id == parsed_entry_id,
                ContentLocalization.locale_code == locale_code,
                ContentLocalization.field_key == field_key,
            )
        )

        if loc is None:
            loc = ContentLocalization(
                content_entry_id=parsed_entry_id,
                locale_code=locale_code,
                field_key=field_key,
            )
            db.add(loc)

        loc.value = value
        loc.status = "TRANSLATED" if (value and str(value).strip()) else "DRAFT"

        # Also sync entry.locale_values
        locale_vals = dict(entry.locale_values or {})
        sub_map = dict(locale_vals.get(locale_code, {}))
        if value is not None:
            sub_map[field_key] = value
        else:
            sub_map.pop(field_key, None)
        locale_vals[locale_code] = sub_map
        entry.locale_values = locale_vals

        db.commit()
        db.refresh(loc)
        return loc

    def get_content_localizations(
        self,
        db: Session,
        entry_id: uuid.UUID | str,
    ) -> list[ContentLocalization]:
        parsed_entry_id = (
            uuid.UUID(str(entry_id))
            if not isinstance(entry_id, uuid.UUID)
            else entry_id
        )
        return list(
            db.scalars(
                select(ContentLocalization)
                .where(ContentLocalization.content_entry_id == parsed_entry_id)
                .order_by(ContentLocalization.field_key)
            )
        )

    def get_content_completeness(
        self,
        db: Session,
        entry_id: uuid.UUID | str,
        locale_code: str,
    ) -> dict[str, Any]:
        parsed_entry_id = (
            uuid.UUID(str(entry_id))
            if not isinstance(entry_id, uuid.UUID)
            else entry_id
        )
        entry = db.scalar(
            select(ContentEntry).where(ContentEntry.id == parsed_entry_id)
        )
        if entry is None:
            raise ValueError(f"Content entry '{entry_id}' not found.")

        version = db.scalar(
            select(TemplateVersion).where(
                TemplateVersion.id == entry.template_version_id
            )
        )
        if version is None:
            raise ValueError("Template version not found.")

        translations = self.get_content_localizations(db, parsed_entry_id)
        return calculate_completeness(version.fields, translations, locale_code)
