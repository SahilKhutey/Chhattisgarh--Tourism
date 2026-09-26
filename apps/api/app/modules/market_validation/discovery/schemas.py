from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

VALID_DISCOVERY_SOURCES = {
    "SEARCH",
    "MAP",
    "NEARBY",
    "CATEGORY",
    "ROUTE",
    "REGION",
    "CREATOR",
    "SHARED_LINK",
    "DIRECT",
    "RECOMMENDATION",
}

VALID_EVENT_TYPES = {
    "content_impression",
    "content_opened",
    "content_section_opened",
    "content_media_opened",
    "content_source_opened",
    "destination_discovered",
    "destination_compared",
    "destination_saved",
    "destination_shared",
    "experience_opened",
    "culture_story_opened",
    "route_content_opened",
    "practical_info_opened",
    "content_search",
    "content_filter_used",
    "content_language_changed",
    "content_translation_used",
    "itinerary_started",
    "itinerary_completed",
}


class DiscoveryEventCreate(BaseModel):
    anonymous_user_id: str
    session_id: str
    event_type: str
    discovery_source: str
    content_entry_id: str | None = None
    destination_id: str | None = None
    experiment_id: str | None = None
    assigned_variant: str | None = None
    metadata_json: dict | None = None

    @model_validator(mode="before")
    @classmethod
    def validate_event(cls, data: dict):
        if isinstance(data, dict):
            src = data.get("discovery_source")
            if src and src not in VALID_DISCOVERY_SOURCES:
                raise ValueError(f"Invalid discovery_source '{src}'. Must be one of {sorted(VALID_DISCOVERY_SOURCES)}")
            ev = data.get("event_type")
            if ev and ev not in VALID_EVENT_TYPES:
                raise ValueError(f"Invalid event_type '{ev}'. Must be one of {sorted(VALID_EVENT_TYPES)}")
        return data


class DiscoveryEventResponse(DiscoveryEventCreate):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DiscoveryEventListResponse(BaseModel):
    total: int
    items: list[DiscoveryEventResponse]


class ContentSearchQuery(BaseModel):
    query: str
    intent_category: str | None = None  # DESTINATION, EXPERIENCE, CULTURE, FOOD, ROUTE, NEARBY, PRACTICAL, EVENT
    region_id: str | None = None
    limit: int = 20


class SearchResultItem(BaseModel):
    content_id: str
    title: str
    content_type: str
    category: str
    short_description: str
    destination_id: str | None = None
    discovery_source: str = "SEARCH"
    relevance_score: float = 1.0


class ContentSearchResponse(BaseModel):
    query: str
    total: int
    results: list[SearchResultItem]
