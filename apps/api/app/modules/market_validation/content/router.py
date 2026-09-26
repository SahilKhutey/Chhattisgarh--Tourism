from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.content.schemas import (
    ContentEntryCreate,
    ContentEntryUpdate,
    ContentEntryResponse,
    ContentEntryListResponse,
)
from app.modules.market_validation.content.service import ContentService

router = APIRouter(
    prefix="/content/entries",
    tags=["market-validation-content"],
)


@router.post(
    "",
    response_model=ContentEntryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_content_entry(
    payload: ContentEntryCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentService(db)
    return service.create_content_entry(payload)


@router.get(
    "",
    response_model=ContentEntryListResponse,
)
def list_content_entries(
    content_type: str | None = Query(default=None),
    category: str | None = Query(default=None),
    governance_status: str | None = Query(default=None),
    language: str | None = Query(default=None),
    destination_id: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentService(db)
    total, items = service.list_content_entries(
        content_type=content_type,
        category=category,
        governance_status=governance_status,
        language=language,
        destination_id=destination_id,
        limit=limit,
        offset=offset,
    )
    return {"total": total, "items": items}


@router.get(
    "/{entry_id}",
    response_model=ContentEntryResponse,
)
def get_content_entry(
    entry_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentService(db)
    return service.get_content_entry(entry_id)


@router.patch(
    "/{entry_id}",
    response_model=ContentEntryResponse,
)
def update_content_entry(
    entry_id: UUID,
    payload: ContentEntryUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentService(db)
    return service.update_content_entry(entry_id, payload)
