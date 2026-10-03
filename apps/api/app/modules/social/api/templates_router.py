from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.social.services.feed_template_service import FeedTemplateService

templates_router = APIRouter(prefix="/social/templates", tags=["Social Feed Templates"])


@templates_router.get("/{slug}")
def get_rendered_feed_template(
    slug: str,
    district: str | None = Query(default=None),
    limit: int | None = Query(default=None, ge=1, le=100),
    db: Session = Depends(get_db),
) -> Any:
    service = FeedTemplateService(db)
    return service.render_template(slug=slug, district=district, limit=limit)
