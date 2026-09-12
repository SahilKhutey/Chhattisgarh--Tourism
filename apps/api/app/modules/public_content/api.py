from __future__ import annotations

import logging
import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.modules.admin.dependencies import AdminUser, get_current_user
from app.modules.content_entries.domain.types import ContentEntryStatus
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_entries.schemas.entries import PublicContentResponse
from app.modules.content_entries.services.runtime_renderer import RuntimeRenderer
from app.modules.content_template.models import ContentTemplate
from app.modules.content_template.models.template_version import TemplateVersion

from .schemas import PublicContent, SitemapItem
from .service import PublicContentService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/content",
    tags=["public-content"],
)

service = PublicContentService()
runtime_renderer = RuntimeRenderer()

SUPPORTED_LOCALES = {"en", "hi", "chg"}


@router.get(
    "/sitemap",
    response_model=list[SitemapItem],
    summary="Get all published content slugs for sitemap generation",
)
def get_sitemap(
    db: Session = Depends(get_db),
) -> list[dict]:
    """Public endpoint returning ONLY published content slugs and last modification timestamps."""
    return service.get_sitemap(db)


@router.get(
    "/preview/{entry_id}",
    response_model=PublicContent,
    summary="Preview draft content (authenticated admin/editors only)",
)
def get_preview_content(
    entry_id: uuid.UUID,
    locale: str = Query("en", description="Requested locale code"),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(get_current_user),
) -> dict:
    """Authenticated preview endpoint for draft/review content."""
    if locale not in SUPPORTED_LOCALES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported locale '{locale}'. Supported locales: {', '.join(sorted(SUPPORTED_LOCALES))}.",
        )

    content = service.get_preview(db=db, entry_id=entry_id, locale=locale)
    if content is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preview content not found.",
        )

    return content


@router.get(
    "/entries/{entry_id}",
    response_model=PublicContentResponse,
    summary="Get public content by entry id",
)
def get_public_content_by_id(
    entry_id: uuid.UUID,
    locale: str = Query(default="en"),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    entry = db.scalar(
        select(ContentEntry).where(
            ContentEntry.id == entry_id,
            ContentEntry.status == ContentEntryStatus.PUBLISHED.value,
        )
    )
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content entry not found.",
        )
    version = db.scalar(
        select(TemplateVersion)
        .options(selectinload(TemplateVersion.fields))
        .where(TemplateVersion.id == entry.template_version_id)
    )
    if not version:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bound template version missing.",
        )
    return runtime_renderer.render(
        version=version,
        entry=entry,
        locale=locale,
    )


@router.get(
    "/{slug}",
    response_model=PublicContent,
    summary="Get published tourism content by slug",
)
def get_public_content(
    slug: str,
    locale: str = Query("en", description="Requested locale code"),
    route: str = Query("destinations", description="Content route prefix"),
    db: Session = Depends(get_db),
) -> dict:
    """
    Public content endpoint enforcing strict published-only boundary.
    Any draft, in-review, or archived content returns 404.
    """
    if locale not in SUPPORTED_LOCALES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported locale '{locale}'. Supported locales: {', '.join(sorted(SUPPORTED_LOCALES))}.",
        )

    content = service.get_content(db=db, slug=slug, locale=locale, route=route)
    if content is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found.",
        )

    return content


@router.get(
    "/{template_slug}/{entry_slug}",
    response_model=PublicContentResponse,
    summary="Get public content by template and entry slug (P8 compatibility)",
)
def get_public_content_by_template_slug(
    template_slug: str,
    entry_slug: str,
    locale: str = Query(default="en"),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    template = db.scalar(
        select(ContentTemplate).where(ContentTemplate.slug == template_slug)
    )
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found.",
        )

    entry = db.scalar(
        select(ContentEntry).where(
            ContentEntry.template_id == template.id,
            ContentEntry.slug == entry_slug,
            ContentEntry.status == ContentEntryStatus.PUBLISHED.value,
        )
    )
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content entry not found.",
        )

    version = db.scalar(
        select(TemplateVersion)
        .options(selectinload(TemplateVersion.fields))
        .where(TemplateVersion.id == entry.template_version_id)
    )
    if not version:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bound template version missing.",
        )

    return runtime_renderer.render(
        version=version,
        entry=entry,
        locale=locale,
    )
