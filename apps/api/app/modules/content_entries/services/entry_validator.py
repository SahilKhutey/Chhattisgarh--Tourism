from __future__ import annotations

import re
from datetime import date, datetime, time
from typing import Any

from app.modules.content_entries.domain.types import EntryValidationError
from app.modules.content_template.models.template_version import TemplateVersion


class ContentEntryValidator:
    ALLOWED_LOCALES = {"en", "hi", "chg"}

    def validate(
        self,
        version: TemplateVersion,
        values: dict[str, Any] | None,
        locale_values: dict[str, Any] | None = None,
        check_accessibility: bool = True,
    ) -> None:
        values = values or {}
        locale_values = locale_values or {}
        errors: list[str] = []

        fields_by_key = {field.key: field for field in version.fields}

        # 1. Reject unknown fields
        for key in values.keys():
            if key not in fields_by_key:
                errors.append(f"{key}: unknown field not defined in template version.")

        # 2. Validate defined fields
        for field in version.fields:
            value = values.get(field.key)

            # Check required
            is_empty = value is None or value == "" or (isinstance(value, list) and len(value) == 0)

            # If translatable and empty in main values, check default locale (e.g. en)
            if field.translatable and is_empty and locale_values:
                for loc in ("en", "hi", "chg"):
                    if loc in locale_values and field.key in locale_values[loc]:
                        loc_val = locale_values[loc][field.key]
                        if loc_val is not None and loc_val != "":
                            is_empty = False
                            break

            if field.required and is_empty:
                errors.append(f"{field.key}: value is required.")
                continue

            if value is not None:
                field_error = self._validate_field_value(field, value, check_accessibility=check_accessibility)
                if field_error:
                    errors.append(field_error)

            # Validate localized values for this field
            if locale_values:
                self._validate_locales(field, locale_values, errors)

        if errors:
            raise EntryValidationError(errors)

    def _validate_field_value(self, field: Any, value: Any, check_accessibility: bool = True) -> str | None:
        field_type = field.type
        config = field.config or {}

        if field_type in {"TEXT", "TEXTAREA", "RICHTEXT"}:
            if not isinstance(value, str):
                return f"{field.key}: expected string."
            min_length = config.get("min_length")
            max_length = config.get("max_length")
            if min_length is not None and len(value) < min_length:
                return f"{field.key}: below minimum length."
            if max_length is not None and len(value) > max_length:
                return f"{field.key}: exceeds maximum length."

        elif field_type == "NUMBER":
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                return f"{field.key}: expected number."
            minimum = config.get("min")
            maximum = config.get("max")
            if minimum is not None and value < minimum:
                return f"{field.key}: below minimum."
            if maximum is not None and value > maximum:
                return f"{field.key}: above maximum."

        elif field_type == "BOOLEAN":
            if not isinstance(value, bool):
                return f"{field.key}: expected boolean."

        elif field_type == "DATE":
            if not isinstance(value, str):
                return f"{field.key}: expected ISO date string."
            try:
                date.fromisoformat(value)
            except ValueError:
                return f"{field.key}: expected ISO date (YYYY-MM-DD)."

        elif field_type == "DATETIME":
            if not isinstance(value, str):
                return f"{field.key}: expected ISO date-time string."
            try:
                datetime.fromisoformat(value)
            except ValueError:
                return f"{field.key}: expected ISO date-time."

        elif field_type == "TIME":
            if not isinstance(value, str):
                return f"{field.key}: expected ISO time string."
            try:
                time.fromisoformat(value)
            except ValueError:
                return f"{field.key}: expected ISO time (HH:MM or HH:MM:SS)."

        elif field_type in {"DROPDOWN", "MULTI_SELECT"}:
            return self._validate_options(field, value)

        elif field_type == "GEO_POINT":
            return self._validate_geo_point(field, value)

        elif field_type == "MAP_REGION":
            return self._validate_map_region(field, value)

        elif field_type == "RELATION":
            return self._validate_relation(field, value)

        elif field_type == "IMAGE":
            if not isinstance(value, (str, dict)):
                return f"{field.key}: invalid media reference."
            if check_accessibility and isinstance(value, dict):
                alt = value.get("alt_text") or value.get("alt")
                if not alt or not isinstance(alt, str) or not alt.strip():
                    return f"{field.key}: alt text is required for image accessibility."

        elif field_type == "GALLERY":
            if not isinstance(value, list):
                return f"{field.key}: expected media array."
            if check_accessibility:
                for idx, item in enumerate(value):
                    if isinstance(item, dict):
                        alt = item.get("alt_text") or item.get("alt")
                        if not alt or not isinstance(alt, str) or not alt.strip():
                            return f"{field.key}[{idx}]: alt text is required for gallery accessibility."

        elif field_type in {"VIDEO", "AUDIO"}:
            if not isinstance(value, (str, dict)):
                return f"{field.key}: invalid media reference."

        elif field_type == "TAGS":
            if not isinstance(value, list):
                return f"{field.key}: expected tag array."
            if any(not isinstance(tag, str) for tag in value):
                return f"{field.key}: tags must be strings."

        return None

    def _validate_options(self, field: Any, value: Any) -> str | None:
        options = {
            option["value"]
            for option in (field.config or {}).get("options", [])
            if isinstance(option, dict) and "value" in option
        }

        if field.type == "DROPDOWN":
            if not isinstance(value, str):
                return f"{field.key}: expected option."
            if value not in options:
                return f"{field.key}: invalid option."

        if field.type == "MULTI_SELECT":
            if not isinstance(value, list):
                return f"{field.key}: expected option array."
            invalid = [item for item in value if item not in options]
            if invalid:
                return f"{field.key}: invalid options: {', '.join(map(str, invalid))}"

        return None

    def _validate_geo_point(self, field: Any, value: Any) -> str | None:
        if not isinstance(value, dict):
            return f"{field.key}: expected {{latitude, longitude}}."

        latitude = value.get("latitude")
        longitude = value.get("longitude")

        if isinstance(latitude, bool) or not isinstance(latitude, (int, float)):
            return f"{field.key}: invalid latitude."
        if isinstance(longitude, bool) or not isinstance(longitude, (int, float)):
            return f"{field.key}: invalid longitude."

        if not -90 <= latitude <= 90:
            return f"{field.key}: latitude out of range."
        if not -180 <= longitude <= 180:
            return f"{field.key}: longitude out of range."

        bounds = (field.config or {}).get("bounds")
        if bounds:
            min_lat = bounds.get("min_latitude", -90)
            max_lat = bounds.get("max_latitude", 90)
            min_lng = bounds.get("min_longitude", -180)
            max_lng = bounds.get("max_longitude", 180)

            if not (min_lat <= latitude <= max_lat):
                return f"{field.key}: latitude outside configured geography."
            if not (min_lng <= longitude <= max_lng):
                return f"{field.key}: longitude outside configured geography."

        return None

    def _validate_map_region(self, field: Any, value: Any) -> str | None:
        if not isinstance(value, dict):
            return f"{field.key}: expected region geometry."

        geometry_type = value.get("type")
        coordinates = value.get("coordinates")

        allowed = {"Polygon", "MultiPolygon"}
        if geometry_type not in allowed:
            return f"{field.key}: unsupported geometry type."
        if not coordinates:
            return f"{field.key}: geometry coordinates required."

        return None

    def _validate_relation(self, field: Any, value: Any) -> str | None:
        if not isinstance(value, list):
            return f"{field.key}: expected relation array."
        for entry_id in value:
            if not isinstance(entry_id, str):
                return f"{field.key}: invalid relation ID."
        return None

    def _validate_locales(
        self,
        field: Any,
        locale_values: dict[str, dict[str, Any]],
        errors: list[str],
    ) -> None:
        for locale in locale_values:
            if locale not in self.ALLOWED_LOCALES:
                errors.append(f"{field.key}: unsupported locale {locale}.")
                continue

            localized = locale_values.get(locale, {})
            if field.translatable and field.required:
                loc_val = localized.get(field.key)
                if loc_val is None or loc_val == "":
                    errors.append(f"{field.key}: required localized value missing for {locale}.")
