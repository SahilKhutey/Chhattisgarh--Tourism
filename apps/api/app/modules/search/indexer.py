from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_template.models.template import ContentTemplate
from app.modules.content_template.models.template_version import TemplateVersion
from app.modules.public_content.resolver import resolve_entry_field

from .cache import SearchCache
from .models import SearchDocument
from .ranking import calculate_quality_score
from .taxonomy import resolve_content_type

logger = logging.getLogger(__name__)

SUPPORTED_LOCALES = ["en", "hi", "chg"]


class SearchIndexer:
    def __init__(self) -> None:
        self.cache = SearchCache()

    def index_entry(
        self,
        db: Session,
        entry: ContentEntry,
    ) -> None:
        """
        Indexes a content entry into denormalized SearchDocument records across supported locales.
        Strict invariant: Only PUBLISHED entries are indexed. Any non-published entry is pruned.
        """
        if entry.status != "PUBLISHED":
            self.remove_entry(db, entry.id)
            return

        version = db.get(TemplateVersion, entry.template_version_id)
        if version is None:
            logger.error("Template version %s not found for entry %s", entry.template_version_id, entry.id)
            return

        template = db.get(ContentTemplate, entry.template_id)
        content_type = resolve_content_type(
            template_slug=template.slug if template else None,
            template_name=template.name if template else None,
            template_category=template.category if template else (version.category if version else None),
        )

        # Retrieve fields list from schema snapshot or version fields
        fields = []
        if hasattr(version, "schema_snapshot") and isinstance(version.schema_snapshot, dict):
            fields = version.schema_snapshot.get("fields", [])
        if not fields and hasattr(version, "fields"):
            fields = [
                {
                    "key": f.field_key if hasattr(f, "field_key") else f.key,
                    "type": f.field_type if hasattr(f, "field_type") else getattr(f, "type", "text"),
                    "required": getattr(f, "required", False),
                }
                for f in version.fields
            ]

        for locale in SUPPORTED_LOCALES:
            self._index_entry_for_locale(
                db=db,
                entry=entry,
                template=template,
                version=version,
                fields=fields,
                content_type=content_type,
                locale=locale,
            )

        db.flush()
        self.cache.invalidate_all()

    def _index_entry_for_locale(
        self,
        db: Session,
        entry: ContentEntry,
        template: ContentTemplate | None,
        version: TemplateVersion,
        fields: list[dict[str, Any]],
        content_type: str,
        locale: str,
    ) -> None:
        title = ""
        description = ""
        text_parts: list[str] = []
        district: str | None = None
        latitude: float | None = None
        longitude: float | None = None
        categories: list[str] = []
        tags: list[str] = []
        has_image = False

        if template and template.category:
            categories.append(template.category.lower().strip())
        elif version and version.category:
            categories.append(version.category.lower().strip())

        for field in fields:
            key = field.get("key")
            if not key:
                continue

            field_type = field.get("type", "text")
            val, _ = resolve_entry_field(
                field_key=key,
                entry_values=entry.values,
                entry_locale_values=entry.locale_values,
                locale=locale,
            )

            if val is None or val == "":
                continue

            # Detect images
            if field_type in {"image", "media"} or "image" in key.lower() or "photo" in key.lower():
                has_image = True

            # Detect geo coordinates
            if field_type in {"geo", "location"} or key.lower() in {"location", "coordinates", "geo"}:
                if isinstance(val, dict):
                    latitude = val.get("latitude") or val.get("lat")
                    longitude = val.get("longitude") or val.get("lng") or val.get("lon")
                elif isinstance(val, (list, tuple)) and len(val) >= 2:
                    latitude = float(val[0])
                    longitude = float(val[1])

            if key.lower() in {"latitude", "lat"} and isinstance(val, (int, float, str)):
                try:
                    latitude = float(val)
                except ValueError:
                    pass

            if key.lower() in {"longitude", "lng", "lon"} and isinstance(val, (int, float, str)):
                try:
                    longitude = float(val)
                except ValueError:
                    pass

            # Detect district
            if key.lower() in {"district", "region", "location_district"}:
                district = str(val).strip()

            # Detect tags
            if key.lower() in {"tags", "keywords"}:
                if isinstance(val, list):
                    tags.extend(str(item).lower().strip() for item in val if item)
                elif isinstance(val, str):
                    tags.extend(t.strip().lower() for t in val.split(",") if t.strip())

            # Detect categories
            if key.lower() in {"category", "categories", "tourism_type"}:
                if isinstance(val, list):
                    categories.extend(str(item).lower().strip() for item in val if item)
                elif isinstance(val, str):
                    categories.extend(c.strip().lower() for c in val.split(",") if c.strip())

            # Textual content
            if isinstance(val, list):
                text_repr = " ".join(str(item) for item in val if item)
            elif isinstance(val, dict):
                text_repr = " ".join(str(v) for v in val.values() if v)
            else:
                text_repr = str(val).strip()

            if key.lower() in {"name", "title"}:
                title = text_repr
            elif key.lower() in {"description", "short_description", "summary"}:
                description = text_repr

            if text_repr:
                text_parts.append(text_repr)

        if not title:
            title = entry.title or entry.slug

        searchable_text = " ".join(text_parts)
        quality_score = calculate_quality_score(
            required_complete=True,
            has_description=bool(description),
            has_image=has_image,
            has_location=(latitude is not None and longitude is not None),
            accessibility_complete=True,
        )

        # Check existing document for this entry and locale
        document = db.scalar(
            select(SearchDocument).where(
                SearchDocument.content_entry_id == entry.id,
                SearchDocument.locale == locale,
            )
        )

        now = datetime.now(timezone.utc)
        unique_categories = list(dict.fromkeys(categories))
        unique_tags = list(dict.fromkeys(tags))

        if document is None:
            document = SearchDocument(
                content_entry_id=entry.id,
                template_id=entry.template_id,
                template_version_id=entry.template_version_id,
                slug=entry.slug,
                locale=locale,
                title=title,
                description=description or None,
                searchable_text=searchable_text,
                content_type=content_type,
                district=district,
                categories=unique_categories,
                tags=unique_tags,
                latitude=latitude,
                longitude=longitude,
                quality_score=quality_score,
                popularity_score=0.0,
                is_published=True,
                published_at=entry.published_at or now,
                updated_at=now,
            )
            db.add(document)
        else:
            document.template_id = entry.template_id
            document.template_version_id = entry.template_version_id
            document.slug = entry.slug
            document.title = title
            document.description = description or None
            document.searchable_text = searchable_text
            document.content_type = content_type
            document.district = district
            document.categories = unique_categories
            document.tags = unique_tags
            document.latitude = latitude
            document.longitude = longitude
            document.quality_score = quality_score
            document.is_published = True
            document.published_at = entry.published_at or now
            document.updated_at = now

    def remove_entry(
        self,
        db: Session,
        entry_id: uuid.UUID | str,
    ) -> None:
        """Removes all SearchDocument rows associated with a content entry."""
        if isinstance(entry_id, str):
            try:
                entry_id = uuid.UUID(entry_id)
            except ValueError:
                return

        db.execute(
            delete(SearchDocument).where(
                SearchDocument.content_entry_id == entry_id
            )
        )
        db.flush()
        self.cache.invalidate_all()

    def rebuild_all(self, db: Session) -> tuple[int, int]:
        """
        Re-indexes all published entries from scratch and removes stale/orphaned documents.
        Returns (indexed_count, removed_count).
        """
        published_entries = list(
            db.scalars(
                select(ContentEntry).where(ContentEntry.status == "PUBLISHED")
            )
        )

        published_ids = {entry.id for entry in published_entries}

        # Remove orphan or stale documents
        all_docs = list(db.scalars(select(SearchDocument)))
        removed_count = 0
        for doc in all_docs:
            if doc.content_entry_id not in published_ids:
                db.delete(doc)
                removed_count += 1

        db.flush()

        # Re-index all published entries
        indexed_count = 0
        for entry in published_entries:
            self.index_entry(db, entry)
            indexed_count += 1

        db.commit()
        return indexed_count, removed_count
