from __future__ import annotations

from fastapi import APIRouter

from app.core.database import get_db
from app.modules.social.api.admin import admin_router, admin_social_sync_router
from app.modules.social.api.admin_social_router import (
    admin_social_router,
)
from app.modules.social.api.content_router import router as content_router
from app.modules.social.api.creators_router import router as creators_router
from app.modules.social.api.feeds_router import router as feeds_router
from app.modules.social.api.interactions_router import router as interactions_router
from app.modules.social.api.moderation_router import router as moderation_router
from app.modules.social.api.public import public_router
from app.modules.social.api.templates_router import templates_router
from app.modules.social.domain.enums import FeedType
from app.modules.social.schemas.content_schemas import FeedCardResponse
from app.modules.social.services.feed_service import FeedService
from fastapi import Depends, Query
from sqlalchemy.orm import Session

social_router = APIRouter()

social_router.include_router(creators_router)
social_router.include_router(content_router)
social_router.include_router(feeds_router)
social_router.include_router(interactions_router)
social_router.include_router(moderation_router)
social_router.include_router(admin_social_router)
social_router.include_router(templates_router)
social_router.include_router(admin_router)
social_router.include_router(admin_social_sync_router)
social_router.include_router(public_router)


@social_router.get("/social/feed", response_model=list[FeedCardResponse], tags=["Consumer Feed"])
def get_consumer_feed(
    limit: int = Query(25, ge=1, le=50),
    offset: int = Query(0, ge=0),
    enable_diversity: bool = Query(True),
    db: Session = Depends(get_db),
) -> list[FeedCardResponse]:
    service = FeedService(db)
    return service.get_feed(
        feed_type=FeedType.HOME,
        limit=limit,
        offset=offset,
        enable_diversity=enable_diversity,
    )
