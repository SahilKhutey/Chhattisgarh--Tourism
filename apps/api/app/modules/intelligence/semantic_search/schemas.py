from __future__ import annotations

from typing import Any
from pydantic import BaseModel, ConfigDict, Field
from app.modules.search.schemas import SearchResult, SearchFacet


class SemanticCandidate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    content_entry_id: str
    distance: float
    similarity: float


class HybridSearchItem(SearchResult):
    semantic_score: float | None = None
    lexical_score: float | None = None
    hybrid_score: float | None = None
    match_reason: str | None = None


class HybridSearchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    query: str
    mode: str = "hybrid"
    total: int
    page: int
    page_size: int
    items: list[HybridSearchItem] = Field(default_factory=list)
    facets: dict[str, list[SearchFacet]] = Field(default_factory=dict)
    semantic_enabled: bool = True
    fallback_used: bool = False
    intent: str | None = None


class DiscoveryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    query: str | None = None
    intent: str | None = None
    results: list[HybridSearchItem] = Field(default_factory=list)
    suggested_queries: list[str] = Field(default_factory=list)
    related_categories: list[str] = Field(default_factory=list)
    recommendations: list[Any] = Field(default_factory=list)
