from __future__ import annotations

import logging
from collections import Counter
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.orm import Session

from .geo import calculate_bounding_box, haversine_km
from .models import SearchDocument, SearchEvent, SearchSynonym, TaxonomyTerm

logger = logging.getLogger(__name__)


class SearchRepository:

    def search_documents(
        self,
        db: Session,
        query_text: str,
        location_hint: str | None = None,
        locale: str = "en",
        content_type: str | None = None,
        district: str | None = None,
        category: str | None = None,
        tag: str | None = None,
        latitude: float | None = None,
        longitude: float | None = None,
        radius_km: float | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[SearchDocument], int]:
        """
        Executes candidate retrieval using PostgreSQL FTS/trigram (with SQLite-safe fallback in test).
        Returns (rows, total_count).
        """
        is_postgres = getattr(db.bind, "dialect", None) and db.bind.dialect.name == "postgresql"

        stmt = select(SearchDocument).where(
            SearchDocument.is_published.is_(True),
            SearchDocument.locale == locale,
        )

        # 1. Text Search Filter
        if query_text:
            cleaned_query = query_text.strip()
            if is_postgres:
                search_vector = func.to_tsvector(
                    "simple",
                    func.concat(
                        func.coalesce(SearchDocument.title, ""),
                        " ",
                        func.coalesce(SearchDocument.description, ""),
                        " ",
                        func.coalesce(SearchDocument.searchable_text, ""),
                    ),
                )
                query_vector = func.plainto_tsquery("simple", cleaned_query)
                trigram_match = or_(
                    SearchDocument.title.ilike(f"%{cleaned_query}%"),
                    SearchDocument.searchable_text.ilike(f"%{cleaned_query}%"),
                    # Trigram similarity matching for typos
                    func.similarity(SearchDocument.title, cleaned_query) > 0.25,
                )
                stmt = stmt.where(or_(search_vector.op("@@")(query_vector), trigram_match))
            else:
                # SQLite-safe fallback
                stmt = stmt.where(
                    or_(
                        SearchDocument.title.ilike(f"%{cleaned_query}%"),
                        SearchDocument.description.ilike(f"%{cleaned_query}%"),
                        SearchDocument.searchable_text.ilike(f"%{cleaned_query}%"),
                    )
                )

        # 2. Location Hint (e.g. parsed from "waterfalls near Raipur")
        if location_hint:
            loc = location_hint.strip()
            stmt = stmt.where(
                or_(
                    SearchDocument.district.ilike(f"%{loc}%"),
                    SearchDocument.title.ilike(f"%{loc}%"),
                    SearchDocument.searchable_text.ilike(f"%{loc}%"),
                )
            )

        # 3. Direct Filters
        if content_type:
            stmt = stmt.where(SearchDocument.content_type == content_type.strip().lower())

        if district:
            stmt = stmt.where(SearchDocument.district.ilike(f"%{district.strip()}%"))

        if category:
            cat = category.strip().lower()
            if is_postgres:
                stmt = stmt.where(SearchDocument.categories.contains([cat]))
            else:
                # String representation in JSON column
                stmt = stmt.where(cast(SearchDocument.categories, String).ilike(f"%{cat}%"))

        if tag:
            t = tag.strip().lower()
            if is_postgres:
                stmt = stmt.where(SearchDocument.tags.contains([t]))
            else:
                stmt = stmt.where(cast(SearchDocument.tags, String).ilike(f"%{t}%"))

        # 4. Geo-radius pre-filtering with bounding box
        if latitude is not None and longitude is not None and radius_km is not None:
            min_lat, max_lat, min_lon, max_lon = calculate_bounding_box(latitude, longitude, radius_km)
            stmt = stmt.where(
                SearchDocument.latitude.isnot(None),
                SearchDocument.longitude.isnot(None),
                SearchDocument.latitude.between(min_lat, max_lat),
                SearchDocument.longitude.between(min_lon, max_lon),
            )

        # 5. Total Count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.scalar(count_stmt) or 0

        # 6. Fetch Candidates for Ranking
        # Over-fetch slightly if geo-filtering or sorting is needed, then slice
        fetch_limit = min(200, max(limit * 2, 50))
        rows = list(
            db.scalars(
                stmt.order_by(
                    SearchDocument.quality_score.desc(),
                    SearchDocument.popularity_score.desc(),
                    SearchDocument.published_at.desc(),
                ).limit(fetch_limit)
            )
        )

        # Exact distance post-filter if radius_km was specified
        if latitude is not None and longitude is not None and radius_km is not None:
            filtered_rows: list[SearchDocument] = []
            for row in rows:
                if row.latitude is not None and row.longitude is not None:
                    dist = haversine_km(latitude, longitude, row.latitude, row.longitude)
                    if dist <= radius_km:
                        filtered_rows.append(row)
            rows = filtered_rows
            total = len(rows)

        return rows, total

    def compute_facets(
        self,
        db: Session,
        locale: str = "en",
        content_type: str | None = None,
        district: str | None = None,
        category: str | None = None,
    ) -> tuple[list[tuple[str, int]], list[tuple[str, int]], list[tuple[str, int]]]:
        """
        Computes facet counts for content_types, districts, and categories.
        Returns (content_types_facets, districts_facets, categories_facets).
        """
        base_stmt = select(SearchDocument).where(
            SearchDocument.is_published.is_(True),
            SearchDocument.locale == locale,
        )

        rows = list(db.scalars(base_stmt.limit(500)))

        ct_counts: Counter[str] = Counter()
        dist_counts: Counter[str] = Counter()
        cat_counts: Counter[str] = Counter()

        for r in rows:
            if r.content_type:
                ct_counts[r.content_type] += 1
            if r.district:
                dist_counts[r.district] += 1
            if r.categories and isinstance(r.categories, list):
                for c in r.categories:
                    if c:
                        cat_counts[str(c)] += 1

        content_types_facets = ct_counts.most_common(10)
        districts_facets = dist_counts.most_common(10)
        categories_facets = cat_counts.most_common(10)

        return content_types_facets, districts_facets, categories_facets

    def get_suggestions(
        self,
        db: Session,
        prefix: str,
        locale: str = "en",
        limit: int = 10,
    ) -> list[tuple[str, str, str]]:
        """
        Finds prefix and trigram matching titles for autocomplete.
        Returns list of (title, content_type, slug).
        """
        cleaned = prefix.strip()
        if not cleaned or len(cleaned) < 2:
            return []

        is_postgres = getattr(db.bind, "dialect", None) and db.bind.dialect.name == "postgresql"

        stmt = select(SearchDocument).where(
            SearchDocument.is_published.is_(True),
            SearchDocument.locale == locale,
        )

        if is_postgres:
            stmt = stmt.where(
                or_(
                    SearchDocument.title.ilike(f"{cleaned}%"),
                    SearchDocument.title.ilike(f"%{cleaned}%"),
                    func.similarity(SearchDocument.title, cleaned) > 0.2,
                )
            ).order_by(
                func.similarity(SearchDocument.title, cleaned).desc(),
                SearchDocument.quality_score.desc(),
            )
        else:
            stmt = stmt.where(
                or_(
                    SearchDocument.title.ilike(f"{cleaned}%"),
                    SearchDocument.title.ilike(f"%{cleaned}%"),
                )
            ).order_by(
                SearchDocument.quality_score.desc(),
            )

        rows = list(db.scalars(stmt.limit(limit)))
        return [(r.title, r.content_type, r.slug) for r in rows]

    def record_search_event(
        self,
        db: Session,
        query_hash: str,
        query_text: str,
        locale: str,
        event_type: str,
        result_count: int,
        filters: dict[str, Any],
        selected_result_id: str | None = None,
    ) -> None:
        """Asynchronously or safely records an anonymous search analytics event."""
        try:
            event = SearchEvent(
                query_hash=query_hash,
                query_text=query_text[:255],
                locale=locale,
                event_type=event_type,
                result_count=result_count,
                selected_result_id=selected_result_id,
                filters=filters,
                created_at=datetime.now(timezone.utc),
            )
            db.add(event)
            db.flush()
        except Exception as exc:
            logger.warning("Failed to record search event: %s", exc)

    def get_synonyms(self, db: Session, locale: str = "en") -> dict[str, list[str]]:
        """Loads active synonyms for the given locale."""
        try:
            rows = list(
                db.scalars(
                    select(SearchSynonym).where(
                        SearchSynonym.locale == locale,
                        SearchSynonym.status == "ACTIVE",
                    )
                )
            )
            syn_map: dict[str, list[str]] = {}
            for r in rows:
                t = r.term.lower().strip()
                s = r.synonym.lower().strip()
                syn_map.setdefault(t, []).append(s)
            return syn_map
        except Exception:
            return {}
