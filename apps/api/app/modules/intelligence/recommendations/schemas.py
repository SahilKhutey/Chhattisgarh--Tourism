from __future__ import annotations

from enum import StrEnum
from pydantic import BaseModel, ConfigDict, Field


class CandidateSource(StrEnum):
    SEMANTIC = "semantic"
    GRAPH = "graph"
    CATEGORY = "category"
    DISTRICT = "district"
    GEO = "geo"
    POPULAR = "popular"


class RecommendationCandidate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    content_id: str
    slug: str
    title: str
    content_type: str
    district: str | None = None
    category: str | None = None
    source: CandidateSource
    raw_score: float
    reason: str


class Recommendation(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    title: str
    content_type: str
    reason: str
    score: float
    district: str | None = None
    category: str | None = None
    thumbnail_url: str | None = None


class RecommendationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    source_content_id: str
    recommendations: list[Recommendation] = Field(default_factory=list)
