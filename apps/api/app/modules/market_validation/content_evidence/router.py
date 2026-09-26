from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.content_evidence.schemas import (
    ContentEvidenceCreate,
    ContentEvidenceUpdate,
    ContentEvidenceResponse,
    ContentEvidenceListResponse,
)
from app.modules.market_validation.content_evidence.service import ContentEvidenceService

router = APIRouter(
    prefix="/content/evidence",
    tags=["market-validation-content-evidence"],
)


@router.post(
    "",
    response_model=ContentEvidenceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_evidence(
    payload: ContentEvidenceCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentEvidenceService(db)
    return service.create_evidence(payload)


@router.get(
    "",
    response_model=ContentEvidenceListResponse,
)
def list_evidence(
    content_entry_id: UUID | None = Query(default=None),
    source_type: str | None = Query(default=None),
    status: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentEvidenceService(db)
    total, items = service.list_evidence(
        content_entry_id=content_entry_id,
        source_type=source_type,
        status=status,
        limit=limit,
        offset=offset,
    )
    return {"total": total, "items": items}


@router.get(
    "/{item_id}",
    response_model=ContentEvidenceResponse,
)
def get_evidence(
    item_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentEvidenceService(db)
    return service.get_evidence(item_id)


@router.patch(
    "/{item_id}",
    response_model=ContentEvidenceResponse,
)
def update_evidence(
    item_id: UUID,
    payload: ContentEvidenceUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentEvidenceService(db)
    return service.update_evidence(item_id, payload)


@router.post(
    "/{item_id}/verify",
    response_model=ContentEvidenceResponse,
)
def verify_evidence(
    item_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentEvidenceService(db)
    verifier_name = getattr(user, "email", None) or getattr(user, "username", "researcher")
    return service.verify_evidence(item_id, verifier=verifier_name)
