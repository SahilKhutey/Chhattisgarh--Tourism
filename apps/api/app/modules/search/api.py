from __future__ import annotations

import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db

from .schemas import (
    DiscoveryLandingResponse,
    SearchRequest,
    SearchResponse,
    SearchSuggestionsResponse,
)
from .service import SearchService

router = APIRouter(
    prefix="/search",
    tags=["search"],
)

logger = logging.getLogger(__name__)
search_service = SearchService()


@router.get("", response_model=SearchResponse)
def search(
    q: str = Query(
        default="",
        max_length=200,
        description="Search query text",
    ),
    locale: str = Query(
        default="en",
        pattern="^(en|hi|chg)$",
        description="Content language locale",
    ),
    content_type: str | None = Query(
        default=None,
        max_length=100,
        description="Filter by content type",
    ),
    district: str | None = Query(
        default=None,
        max_length=150,
        description="Filter by district",
    ),
    category: str | None = Query(
        default=None,
        max_length=100,
        description="Filter by category",
    ),
    tag: str | None = Query(
        default=None,
        max_length=100,
        description="Filter by tag",
    ),
    latitude: float | None = Query(
        default=None,
        ge=-90.0,
        le=90.0,
        description="Latitude for proximity search",
    ),
    longitude: float | None = Query(
        default=None,
        ge=-180.0,
        le=180.0,
        description="Longitude for proximity search",
    ),
    radius_km: float | None = Query(
        default=None,
        gt=0.0,
        le=500.0,
        description="Search radius in kilometers",
    ),
    page: int = Query(
        default=1,
        ge=1,
        description="Page number",
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=50,
        description="Results per page",
    ),
    mode: str = Query(
        default="hybrid",
        pattern="^(hybrid|lexical)$",
        description="Search mode: hybrid (lexical + semantic) or lexical",
    ),
    db: Session = Depends(get_db),
) -> SearchResponse:
    """
    Search and discovery endpoint for published tourism content.
    Supports hybrid (lexical + semantic) search, taxonomy filters, and geographic proximity.
    """
    if mode == "hybrid" and q.strip():
        try:
            from app.modules.intelligence.semantic_search.service import SemanticSearchService
            sem_service = SemanticSearchService()
            hybrid_resp = sem_service.search(
                db=db,
                query=q,
                locale=locale,
                content_type=content_type,
                district=district,
                category=category,
                tag=tag,
                latitude=latitude,
                longitude=longitude,
                radius_km=radius_km,
                page=page,
                page_size=page_size,
                mode="hybrid",
            )
            # Fetch facets from lexical repository
            facets = search_service.repository.get_facets(db=db, locale=locale)
            return SearchResponse(
                query=hybrid_resp.query,
                locale=locale,
                page=hybrid_resp.page,
                page_size=hybrid_resp.page_size,
                total=hybrid_resp.total,
                results=[
                    SearchResult(
                        id=it.id,
                        slug=it.slug,
                        title=it.title,
                        description=it.description,
                        content_type=it.content_type,
                        district=it.district,
                        categories=it.categories,
                        tags=it.tags,
                        score=it.score,
                        semantic_score=it.semantic_score,
                        lexical_score=it.lexical_score,
                        match_reason=it.match_reason,
                    )
                    for it in hybrid_resp.items
                ],
                content_types=facets.get("content_types", []),
                districts=facets.get("districts", []),
                categories=facets.get("categories", []),
                mode="hybrid",
                semantic_enabled=hybrid_resp.semantic_enabled,
            )
        except Exception as e:
            logger.warning("Hybrid search delegation failed; falling back to lexical search: %s", e)

    request = SearchRequest(
        q=q,
        locale=locale,
        content_type=content_type,
        district=district,
        category=category,
        tag=tag,
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km,
        page=page,
        page_size=page_size,
    )

    resp = search_service.search(db=db, request=request)
    resp.mode = "lexical"
    return resp


@router.get("/suggestions", response_model=SearchSuggestionsResponse)
def get_suggestions(
    q: str = Query(
        min_length=2,
        max_length=100,
        description="Query prefix for autocomplete suggestions",
    ),
    locale: str = Query(
        default="en",
        pattern="^(en|hi|chg)$",
        description="Locale for autocomplete",
    ),
    limit: int = Query(
        default=10,
        ge=1,
        le=20,
        description="Maximum number of suggestions",
    ),
    db: Session = Depends(get_db),
) -> SearchSuggestionsResponse:
    """
    Returns autocomplete suggestions for typing query prefixes.
    """
    return search_service.suggestions(
        db=db,
        prefix=q,
        locale=locale,
        limit=limit,
    )


@router.get("/discovery", response_model=DiscoveryLandingResponse)
def get_discovery(
    locale: str = Query(
        default="en",
        pattern="^(en|hi|chg)$",
        description="Locale for discovery landing",
    ),
    db: Session = Depends(get_db),
) -> DiscoveryLandingResponse:
    """
    Returns curated discovery highlights, popular categories, and top destinations.
    """
    return search_service.get_discovery_landing(
        db=db,
        locale=locale,
    )
