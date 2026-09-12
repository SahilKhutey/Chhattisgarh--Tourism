from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class SearchResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    title: str
    description: str | None = None
    content_type: str
    district: str | None = None
    categories: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    distance_km: float | None = None
    score: float = 0.0
    semantic_score: float | None = None
    lexical_score: float | None = None
    match_reason: str | None = None


class SearchFacet(BaseModel):
    value: str
    count: int


class SearchResponse(BaseModel):
    query: str
    locale: str
    page: int
    page_size: int
    total: int
    results: list[SearchResult]
    content_types: list[SearchFacet] = Field(default_factory=list)
    districts: list[SearchFacet] = Field(default_factory=list)
    categories: list[SearchFacet] = Field(default_factory=list)
    mode: str = "hybrid"
    semantic_enabled: bool = True


class SearchRequest(BaseModel):
    q: str = Field(default="", max_length=200)
    locale: str = "en"
    content_type: str | None = None
    district: str | None = None
    category: str | None = None
    tag: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    radius_km: float | None = Field(default=None, gt=0, le=500)
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=50)


class SuggestionItem(BaseModel):
    text: str
    type: str = "content"
    slug: str | None = None


class SearchSuggestionsResponse(BaseModel):
    suggestions: list[SuggestionItem] = Field(default_factory=list)


class DiscoveryLandingResponse(BaseModel):
    featured_destinations: list[SearchResult] = Field(default_factory=list)
    popular_categories: list[SearchFacet] = Field(default_factory=list)
    popular_districts: list[SearchFacet] = Field(default_factory=list)
