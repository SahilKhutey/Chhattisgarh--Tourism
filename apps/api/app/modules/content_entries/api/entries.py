from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.modules.admin.dependencies import (
    AdminUser,
    require_content_archive,
    require_content_create,
    require_content_publish,
    require_content_read,
    require_content_update,
)
from app.modules.content_entries.domain.types import (
    ContentEntryStatus,
    EntryConflictError,
    EntryNotFoundError,
    EntryValidationError,
)
from app.modules.accessibility.publication_gate import AccessibilityPublicationError
from app.modules.localization.publication_gate import LocalizationPublicationError
from app.modules.glossary.validator import GlossaryPublicationError
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_entries.repositories.entry_repository import (
    ContentEntryRepository,
)
from app.modules.content_entries.schemas.entries import (
    ContentEntryCreate,
    ContentEntryListResponse,
    ContentEntryResponse,
    ContentEntryUpdate,
    PublicContentResponse,
    RuntimeSchemaResponse,
)
from app.modules.content_entries.services.entry_service import (
    ContentEntryService,
)
from app.modules.content_entries.services.runtime_renderer import (
    RuntimeRenderer,
)
from app.modules.content_template.models import ContentTemplate
from app.modules.content_template.models.template_version import TemplateVersion

admin_content_router = APIRouter(
    prefix="/admin/content-entries",
    tags=["admin-content-entries"],
)

admin_schema_router = APIRouter(
    prefix="/admin/templates",
    tags=["admin-templates"],
)

public_content_router = APIRouter(
    prefix="/content",
    tags=["public-content"],
)

entry_service = ContentEntryService()
entry_repository = ContentEntryRepository()
runtime_renderer = RuntimeRenderer()


def entry_to_response(entry: ContentEntry, db: Session) -> ContentEntryResponse:
    is_stale = False
    template_name = None
    live_template_version = None
    version_number = None

    if entry.template:
        template_name = entry.template.name
        if entry.template.published_version_id:
            live_version = db.scalar(
                select(TemplateVersion).where(
                    TemplateVersion.id == entry.template.published_version_id
                )
            )
            if live_version:
                live_template_version = live_version.version_number

            is_stale = (
                entry.template_version_id != entry.template.published_version_id
            )

    if entry.template_version:
        version_number = entry.template_version.version_number

    return ContentEntryResponse(
        id=str(entry.id),
        template_id=str(entry.template_id),
        template_version_id=str(entry.template_version_id),
        slug=entry.slug,
        title=entry.title,
        status=entry.status,
        values=entry.values or {},
        locale_values=entry.locale_values or {},
        revision=entry.revision,
        created_by=str(entry.created_by),
        updated_by=str(entry.updated_by),
        published_at=entry.published_at,
        created_at=entry.created_at,
        updated_at=entry.updated_at,
        schema_state="STALE" if is_stale else "CURRENT",
        template_version_number=version_number,
        template_name=template_name,
        live_template_version=live_template_version,
    )


def _fetch_runtime_schema(template_id: str, db: Session) -> dict[str, Any]:
    try:
        tid = uuid.UUID(str(template_id))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found.",
        )

    template = db.scalar(
        select(ContentTemplate).where(ContentTemplate.id == tid)
    )

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found.",
        )

    if not template.published_version_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template has no published version.",
        )

    version = db.scalar(
        select(TemplateVersion)
        .options(selectinload(TemplateVersion.fields))
        .where(TemplateVersion.id == template.published_version_id)
    )

    if not version:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Published version missing.",
        )

    return {
        "template": {
            "id": str(template.id),
            "slug": version.slug,
            "version": version.version_number,
        },
        "fields": [
            {
                "key": field.key,
                "label": field.label,
                "type": field.type,
                "required": field.required,
                "translatable": field.translatable,
                "order": field.order,
                "group": field.group,
                "helpText": field.help_text,
                "config": field.config or {},
            }
            for field in sorted(version.fields, key=lambda f: f.order)
        ],
    }


# 1. Runtime schema endpoints
@admin_schema_router.get(
    "/{template_id}/runtime-schema",
    response_model=RuntimeSchemaResponse,
)
def get_template_runtime_schema(
    template_id: str,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_content_read),
) -> dict[str, Any]:
    return _fetch_runtime_schema(template_id, db)


@admin_content_router.get(
    "/templates/{template_id}/runtime-schema",
    response_model=RuntimeSchemaResponse,
)
def get_entry_runtime_schema(
    template_id: str,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_content_read),
) -> dict[str, Any]:
    return _fetch_runtime_schema(template_id, db)


# 2. Content Entries CRUD
@admin_content_router.get(
    "",
    response_model=ContentEntryListResponse,
)
def list_entries(
    template_id: str | None = Query(default=None),
    status: str | None = Query(default=None),
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_content_read),
) -> ContentEntryListResponse:
    offset = (page - 1) * page_size
    entries = entry_repository.list_entries(
        db,
        template_id=template_id,
        status=status,
        search=search,
        offset=offset,
        limit=page_size,
    )
    total = entry_repository.count_entries(
        db,
        template_id=template_id,
        status=status,
        search=search,
    )

    items = [entry_to_response(entry, db) for entry in entries]
    return ContentEntryListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@admin_content_router.get(
    "/{entry_id}",
    response_model=ContentEntryResponse,
)
def get_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_content_read),
) -> ContentEntryResponse:
    try:
        eid = uuid.UUID(str(entry_id))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content entry not found.",
        )

    entry = entry_repository.get(db, eid)
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content entry not found.",
        )

    return entry_to_response(entry, db)


@admin_content_router.post(
    "/templates/{template_id}",
    response_model=ContentEntryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_entry(
    template_id: str,
    payload: ContentEntryCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_content_create),
) -> ContentEntryResponse:
    try:
        tid = uuid.UUID(str(template_id))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found.",
        )

    template = db.scalar(
        select(ContentTemplate).where(ContentTemplate.id == tid)
    )
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found.",
        )

    if not template.published_version_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": "Template has no published version."},
        )

    version = db.scalar(
        select(TemplateVersion)
        .options(selectinload(TemplateVersion.fields))
        .where(TemplateVersion.id == template.published_version_id)
    )
    if not version:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Published version missing.",
        )

    try:
        entry = entry_service.create(
            db=db,
            template=template,
            version=version,
            payload=payload,
            user_id=user.id,
        )
        db.commit()
        db.refresh(entry)
    except EntryValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "Invalid content entry.",
                "errors": exc.errors,
            },
        )

    return entry_to_response(entry, db)


@admin_content_router.patch(
    "/{entry_id}",
    response_model=ContentEntryResponse,
)
def update_entry(
    entry_id: str,
    payload: ContentEntryUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_content_update),
) -> ContentEntryResponse:
    try:
        eid = uuid.UUID(str(entry_id))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content entry not found.",
        )

    try:
        entry = entry_service.update(
            db=db,
            entry_id=eid,
            payload=payload,
            user_id=user.id,
        )
        db.commit()
        db.refresh(entry)
    except EntryNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content entry not found.",
        )
    except EntryConflictError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": exc.message,
                "current_revision": exc.current_revision,
            },
        )
    except EntryValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "Invalid content entry.",
                "errors": exc.errors,
            },
        )

    return entry_to_response(entry, db)


@admin_content_router.post(
    "/{entry_id}/publish",
    response_model=ContentEntryResponse,
)
def publish_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_content_publish),
) -> ContentEntryResponse:
    try:
        eid = uuid.UUID(str(entry_id))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content entry not found.",
        )

    try:
        entry = entry_service.publish(
            db=db,
            entry_id=eid,
            user_id=user.id,
        )
        db.commit()
        db.refresh(entry)
    except EntryNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content entry not found.",
        )
    except EntryValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "Invalid content entry.",
                "errors": exc.errors,
            },
        )
    except AccessibilityPublicationError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "ACCESSIBILITY_GATE_FAILED",
                "message": exc.message,
                "issues": exc.issues,
            },
        )
    except LocalizationPublicationError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "LOCALIZATION_GATE_FAILED",
                "message": str(exc),
            },
        )
    except GlossaryPublicationError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "GLOSSARY_GATE_FAILED",
                "message": str(exc),
            },
        )

    return entry_to_response(entry, db)


@admin_content_router.post(
    "/{entry_id}/archive",
    response_model=ContentEntryResponse,
)
def archive_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_content_archive),
) -> ContentEntryResponse:
    try:
        eid = uuid.UUID(str(entry_id))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content entry not found.",
        )

    try:
        entry = entry_service.archive(
            db=db,
            entry_id=eid,
            user_id=user.id,
        )
        db.commit()
        db.refresh(entry)
    except EntryNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content entry not found.",
        )

    return entry_to_response(entry, db)


# 3. Public Consumer Rendering Contract
@public_content_router.get(
    "/{template_slug}/{entry_slug}",
    response_model=PublicContentResponse,
)
def get_public_content(
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
