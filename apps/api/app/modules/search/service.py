from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from .cache import SearchCache, build_cache_key
from .geo import haversine_km
from .query_parser import parse_query
from .ranking import (
    calculate_exact_match,
    calculate_score,
    distance_score,
    freshness_score,
)
from .repository import SearchRepository
from .schemas import (
    DiscoveryLandingResponse,
    SearchFacet,
    SearchRequest,
    SearchResponse,
    SearchResult,
    SearchSuggestionsResponse,
    SuggestionItem,
)

logger = logging.getLogger(__name__)


class SearchService:
    def __init__(
        self,
        repository: SearchRepository | None = None,
        cache: SearchCache | None = None,
    ) -> None:
        self.repository = repository or SearchRepository()
        self.cache = cache or SearchCache()

    def search(
        self,
        db: Session,
        request: SearchRequest,
    ) -> SearchResponse:
        """
        Orchestrates discovery search: cache check, query parsing, candidate retrieval,
        ranking, facet calculation, pagination, and analytics logging.
        """
        cache_key = build_cache_key(request.model_dump())
        cached_data = self.cache.get(cache_key)
        if cached_data:
            return SearchResponse(**cached_data)

        parsed = parse_query(request.q)
        query_text = parsed.text
        location_hint = parsed.location

        # Retrieve candidates from repository
        candidates, total_candidates = self.repository.search_documents(
            db=db,
            query_text=query_text,
            location_hint=location_hint,
            locale=request.locale,
            content_type=request.content_type,
            district=request.district,
            category=request.category,
            tag=request.tag,
            latitude=request.latitude,
            longitude=request.longitude,
            radius_km=request.radius_km,
            offset=0,
            limit=100,
        )

        now = datetime.now(timezone.utc)
        scored_results: list[SearchResult] = []

        for doc in candidates:
            # Geographic distance calculation
            dist_km: float | None = None
            if (
                request.latitude is not None
                and request.longitude is not None
                and doc.latitude is not None
                and doc.longitude is not None
            ):
                dist_km = round(
                    haversine_km(
                        request.latitude,
                        request.longitude,
                        doc.latitude,
                        doc.longitude,
                    ),
                    2,
                )

            # Ranking calculation
            pub_date = doc.published_at or doc.updated_at or now
            if pub_date.tzinfo is None:
                pub_date = pub_date.replace(tzinfo=timezone.utc)
            age_days = max(0.0, (now - pub_date).total_seconds() / 86400.0)

            freshness = freshness_score(age_days)
            geo_sc = distance_score(dist_km)
            exact_match = calculate_exact_match(query_text, doc.title)

            # Heuristic text relevance score
            if not query_text:
                text_sc = 1.0
            elif query_text.lower() in doc.title.lower():
                text_sc = 0.9
            elif any(word in doc.title.lower() for word in query_text.lower().split()):
                text_sc = 0.7
            elif query_text.lower() in (doc.searchable_text or "").lower():
                text_sc = 0.5
            else:
                text_sc = 0.3

            final_score = calculate_score(
                text_score=text_sc,
                exact_match=exact_match,
                quality_score=doc.quality_score or 0.0,
                popularity_score=doc.popularity_score or 0.0,
                freshness=freshness,
                geo_score=geo_sc,
            )

            scored_results.append(
                SearchResult(
                    id=str(doc.content_entry_id),
                    slug=doc.slug,
                    title=doc.title,
                    description=doc.description,
                    content_type=doc.content_type,
                    district=doc.district,
                    categories=doc.categories or [],
                    tags=doc.tags or [],
                    distance_km=dist_km,
                    score=round(final_score, 4),
                )
            )

        # Sort by final ranking score descending
        scored_results.sort(key=lambda item: item.score, reverse=True)

        # Pagination
        offset = (request.page - 1) * request.page_size
        paged_results = scored_results[offset : offset + request.page_size]

        # Compute facet aggregations
        ct_facets, dist_facets, cat_facets = self.repository.compute_facets(
            db=db,
            locale=request.locale,
            content_type=request.content_type,
            district=request.district,
            category=request.category,
        )

        response = SearchResponse(
            query=request.q,
            locale=request.locale,
            page=request.page,
            page_size=request.page_size,
            total=len(scored_results),
            results=paged_results,
            content_types=[SearchFacet(value=v, count=c) for v, c in ct_facets],
            districts=[SearchFacet(value=v, count=c) for v, c in dist_facets],
            categories=[SearchFacet(value=v, count=c) for v, c in cat_facets],
        )

        # Record search analytics
        event_type = "SEARCH_ZERO_RESULTS" if len(scored_results) == 0 and request.q else "SEARCH_PERFORMED"
        self.repository.record_search_event(
            db=db,
            query_hash=cache_key.replace("cg:search:", ""),
            query_text=request.q,
            locale=request.locale,
            event_type=event_type,
            result_count=len(scored_results),
            filters={
                "district": request.district,
                "category": request.category,
                "content_type": request.content_type,
                "tag": request.tag,
                "radius_km": request.radius_km,
            },
        )

        # Cache response
        self.cache.set(cache_key, response.model_dump(), ttl=60)
        return response

    def suggestions(
        self,
        db: Session,
        prefix: str,
        locale: str = "en",
        limit: int = 10,
    ) -> SearchSuggestionsResponse:
        """Fetches autocomplete suggestions for search terms."""
        suggestions_raw = self.repository.get_suggestions(
            db=db,
            prefix=prefix,
            locale=locale,
            limit=limit,
        )

        return SearchSuggestionsResponse(
            suggestions=[
                SuggestionItem(
                    text=title,
                    type=content_type,
                    slug=slug,
                )
                for title, content_type, slug in suggestions_raw
            ]
        )

    def get_discovery_landing(
        self,
        db: Session,
        locale: str = "en",
    ) -> DiscoveryLandingResponse:
        """Provides featured and curated discovery items for zero-query landing."""
        search_req = SearchRequest(
            q="",
            locale=locale,
            page=1,
            page_size=6,
        )
        search_resp = self.search(db, search_req)

        return DiscoveryLandingResponse(
            featured_destinations=search_resp.results,
            popular_categories=search_resp.categories,
            popular_districts=search_resp.districts,
        )
