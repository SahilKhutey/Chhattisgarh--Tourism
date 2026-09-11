from __future__ import annotations

import uuid
from typing import Any
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_template.models.template_version import TemplateVersion

from .cache import PublicContentCache
from .repository import PublicContentRepository
from .resolver import resolve_entry_field
from .seo import build_breadcrumbs, build_canonical_url, resolve_seo_metadata


class PublicContentService:
    """Service providing dynamic, immutable schema-driven public content."""

    def __init__(self) -> None:
        self.repository = PublicContentRepository()
        self.cache = PublicContentCache()

    def get_content(
        self,
        db: Session,
        slug: str,
        locale: str = "en",
        route: str = "destinations",
    ) -> dict[str, Any] | None:
        # 1. Check Redis Cache
        cached = self.cache.get(slug, locale)
        if cached:
            return cached

        # 2. Query Published Content Entry (Enforces Security Boundary)
        entry = self.repository.get_published_by_slug(db, slug)
        if entry is None:
            return None

        # 3. Resolve Exact Bound TemplateVersion
        template_version = db.get(TemplateVersion, entry.template_version_id)
        if template_version is None:
            return None

        # 4. Resolve Fields from Immutable Schema Snapshot
        fields = self._resolve_fields(db, template_version, entry, locale)

        # 5. Extract Primary Metadata
        name_val = None
        desc_val = None
        for f in fields:
            if f["key"] in {"name", "title"} and isinstance(f["value"], str):
                name_val = f["value"]
            elif f["key"] in {"description", "summary", "about"} and isinstance(f["value"], str):
                desc_val = f["value"]

        name, description, seo_title, seo_description = resolve_seo_metadata(
            slug=entry.slug,
            title_val=entry.title,
            name_val=name_val,
            desc_val=desc_val,
            fields=fields,
        )

        canonical_url = build_canonical_url(entry.slug, locale, route)
        breadcrumbs = build_breadcrumbs(name, entry.slug, locale, route)

        result: dict[str, Any] = {
            "id": str(entry.id),
            "slug": entry.slug,
            "template_id": str(entry.template_id),
            "template_version": template_version.version,
            "locale": locale,
            "name": name,
            "description": description,
            "fields": fields,
            "canonical_url": canonical_url,
            "published_at": (
                entry.published_at.isoformat()
                if entry.published_at
                else entry.created_at.isoformat()
            ),
            "seo_title": seo_title,
            "seo_description": seo_description,
            "breadcrumbs": breadcrumbs,
        }

        # 6. Cache Compiled Result
        self.cache.set(slug, locale, result)
        return result

    def get_preview(
        self,
        db: Session,
        entry_id: uuid.UUID,
        locale: str = "en",
        route: str = "destinations",
    ) -> dict[str, Any] | None:
        """Preview content for authenticated admin/editors regardless of publication status."""
        entry = self.repository.get_entry_for_preview(db, entry_id)
        if entry is None:
            return None

        template_version = db.get(TemplateVersion, entry.template_version_id)
        if template_version is None:
            return None

        fields = self._resolve_fields(db, template_version, entry, locale)

        name_val = None
        desc_val = None
        for f in fields:
            if f["key"] in {"name", "title"} and isinstance(f["value"], str):
                name_val = f["value"]
            elif f["key"] in {"description", "summary", "about"} and isinstance(f["value"], str):
                desc_val = f["value"]

        name, description, seo_title, seo_description = resolve_seo_metadata(
            slug=entry.slug,
            title_val=entry.title,
            name_val=name_val,
            desc_val=desc_val,
            fields=fields,
        )

        canonical_url = build_canonical_url(entry.slug, locale, route)
        breadcrumbs = build_breadcrumbs(f"[Preview] {name}", entry.slug, locale, route)

        return {
            "id": str(entry.id),
            "slug": entry.slug,
            "template_id": str(entry.template_id),
            "template_version": template_version.version,
            "locale": locale,
            "name": name,
            "description": description,
            "fields": fields,
            "canonical_url": canonical_url,
            "published_at": entry.published_at.isoformat() if entry.published_at else None,
            "seo_title": f"[Preview] {seo_title}",
            "seo_description": seo_description,
            "breadcrumbs": breadcrumbs,
        }

    def get_sitemap(self, db: Session) -> list[dict[str, str | None]]:
        items = self.repository.get_all_published_sitemap(db)
        return [{"slug": slug, "updated_at": updated_at} for slug, updated_at in items]

    def _resolve_fields(
        self,
        db: Session,
        template_version: TemplateVersion,
        entry: ContentEntry,
        locale: str,
    ) -> list[dict[str, Any]]:
        snapshot = template_version.schema_snapshot
        fields: list[dict[str, Any]] = []

        for field_def in snapshot["fields"]:
            key = field_def["key"]
            f_type = field_def["type"]

            value, _ = resolve_entry_field(
                field_key=key,
                entry_values=entry.values,
                entry_locale_values=entry.locale_values,
                locale=locale,
            )

            # Resolve RELATION fields to public summaries (filtering unpublished)
            if f_type == "RELATION" and value:
                value = self._resolve_relations(db, value, locale)

            fields.append(
                {
                    "key": key,
                    "label": field_def["label"],
                    "type": f_type,
                    "value": value,
                    "group": field_def.get("group"),
                }
            )

        return fields

    def _resolve_relations(
        self,
        db: Session,
        relation_value: Any,
        locale: str,
    ) -> list[dict[str, Any]]:
        target_ids: list[uuid.UUID] = []

        if isinstance(relation_value, list):
            for item in relation_value:
                try:
                    target_ids.append(uuid.UUID(str(item)))
                except (ValueError, TypeError):
                    continue
        elif isinstance(relation_value, (str, uuid.UUID)):
            try:
                target_ids.append(uuid.UUID(str(relation_value)))
            except (ValueError, TypeError):
                pass

        if not target_ids:
            return []

        # Strictly select ONLY published target entries
        stmt = select(ContentEntry).where(
            ContentEntry.id.in_(target_ids),
            ContentEntry.status == "PUBLISHED",
        )
        published_targets = db.scalars(stmt).all()

        summaries: list[dict[str, Any]] = []
        for target in published_targets:
            # Resolve localized title if present
            target_name = (
                (target.locale_values or {}).get(locale, {}).get("title")
                or (target.locale_values or {}).get(locale, {}).get("name")
                or target.title
            )
            # Find image if present
            hero_image = (target.values or {}).get("hero_image") or (target.values or {}).get("image")

            summaries.append(
                {
                    "id": str(target.id),
                    "slug": target.slug,
                    "name": target_name,
                    "url": f"/{locale}/destinations/{target.slug}",
                    "hero_image": hero_image,
                }
            )

        return summaries
