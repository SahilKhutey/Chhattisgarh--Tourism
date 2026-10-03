from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.social.creators.schemas import CreatorResponse
from app.modules.social.domain.enums import ContentType, FeedType
from app.modules.social.engine import SocialEngine
from app.modules.social.feed.query import FeedQuery
from app.modules.social.schemas.content_schemas import FeedCardResponse

public_router = APIRouter(prefix="/public", tags=["Social Public Discovery"])


@public_router.get("/feed", response_model=list[FeedCardResponse])
def get_public_feed(
    feed_type: FeedType = Query(FeedType.HOME),
    district_id: str | None = Query(None),
    content_type: ContentType | None = Query(None),
    cultural_tag: str | None = Query(None),
    place_slug: str | None = Query(None),
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    enable_diversity: bool = Query(True),
    db: Session = Depends(get_db),
) -> Any:
    engine = SocialEngine(db)
    query = FeedQuery(
        feed_type=feed_type,
        district_id=district_id,
        content_type=content_type,
        cultural_tag=cultural_tag,
        place_slug=place_slug,
        limit=limit,
        offset=offset,
        enable_diversity=enable_diversity,
    )
    return engine.feed.get_feed(query)


@public_router.get("/feed/{content_id}/source")
def get_content_source_url(
    content_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> Any:
    engine = SocialEngine(db)
    resolved = engine.feed.resolve_source_url(content_id)
    return {
        "content_id": str(content_id),
        "source_url": resolved,
        "is_available": resolved != "SOURCE_UNAVAILABLE",
    }


@public_router.get("/creators", response_model=list[CreatorResponse])
def list_public_creators(
    district_id: str | None = Query(None),
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> Any:
    engine = SocialEngine(db)
    return engine.creators.list_creators(
        district_id=district_id,
        verified_only=True,
        status="ACTIVE",
        limit=limit,
        offset=offset,
    )


@public_router.get("/creators/{handle}", response_model=CreatorResponse)
def get_creator_by_handle(
    handle: str,
    db: Session = Depends(get_db),
) -> Any:
    engine = SocialEngine(db)
    return engine.creators.get_by_handle(handle)


__all__ = ["public_router"]
