from __future__ import annotations

from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class EntityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    entity_type: str
    canonical_name: str
    slug: str
    locale: str
    aliases: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class RelationshipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source_entity_id: str
    relationship_type: str
    target_entity_id: str
    confidence: float
    source: str


class PublicContextEntity(BaseModel):
    name: str
    type: str
    slug: str | None = None


class PublicContextResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    entity: PublicContextEntity
    located_in: PublicContextEntity | None = None
    categories: list[str] = Field(default_factory=list)
    activities: list[str] = Field(default_factory=list)
    near_attractions: list[PublicContextEntity] = Field(default_factory=list)
