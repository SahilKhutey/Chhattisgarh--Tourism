from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.social.domain.enums import ContentType, FeedType
from app.modules.social.schemas.content_schemas import FeedCardResponse
from app.modules.social.services.feed_service import FeedService

router = APIRouter(prefix="/social/feeds", tags=["social-feeds"])


@router.get("/home", response_model=list[FeedCardResponse])
def get_home_feed(
    limit: int = Query(25, ge=1, le=50),
    offset: int = Query(0, ge=0),
    enable_diversity: bool = Query(True, description="Enforce anti-monopoly district and creator diversity"),
    db: Session = Depends(get_db),
) -> list[FeedCardResponse]:
    service = FeedService(db)
    return service.get_feed(
        feed_type=FeedType.HOME,
        limit=limit,
        offset=offset,
        enable_diversity=enable_diversity,
    )


@router.get("/explore", response_model=list[FeedCardResponse])
def get_explore_feed(
    content_type: ContentType | None = Query(None, description="Filter by format (REEL, VIDEO, STORY)"),
    limit: int = Query(30, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> list[FeedCardResponse]:
    service = FeedService(db)
    return service.get_feed(
        feed_type=FeedType.EXPLORE,
        content_type=content_type,
        limit=limit,
        offset=offset,
        enable_diversity=True,
    )


@router.get("/regional/{district}", response_model=list[FeedCardResponse])
def get_regional_feed(
    district: str,
    place_slug: str | None = Query(None, description="Optional filter by destination place slug"),
    limit: int = Query(30, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> list[FeedCardResponse]:
    service = FeedService(db)
    return service.get_feed(
        feed_type=FeedType.REGIONAL,
        district_id=district.lower(),
        place_slug=place_slug,
        limit=limit,
        offset=offset,
        enable_diversity=False,  # Within a specific district, show all district content
    )


@router.get("/culture", response_model=list[FeedCardResponse])
def get_culture_feed(
    limit: int = Query(30, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> list[FeedCardResponse]:
    service = FeedService(db)
    return service.get_feed(
        feed_type=FeedType.CULTURE,
        limit=limit,
        offset=offset,
        enable_diversity=True,
    )
