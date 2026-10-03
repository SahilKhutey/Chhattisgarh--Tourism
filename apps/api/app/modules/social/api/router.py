from __future__ import annotations

from fastapi import APIRouter

from app.modules.social.api.admin_social_router import (
    admin_social_router,
)
from app.modules.social.api.content_router import router as content_router
from app.modules.social.api.creators_router import router as creators_router
from app.modules.social.api.feeds_router import router as feeds_router
from app.modules.social.api.interactions_router import router as interactions_router
from app.modules.social.api.moderation_router import router as moderation_router
from app.modules.social.api.templates_router import templates_router

social_router = APIRouter()

social_router.include_router(creators_router)
social_router.include_router(content_router)
social_router.include_router(feeds_router)
social_router.include_router(interactions_router)
social_router.include_router(moderation_router)
social_router.include_router(admin_social_router)
social_router.include_router(templates_router)
