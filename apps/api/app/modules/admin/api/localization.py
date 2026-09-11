from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import (
    AdminUser,
    require_locale_read,
    require_locale_write,
)
from app.modules.localization.schemas import (
    LocalizationCompleteness,
    LocalizationUpdate,
    LocaleResponse,
    TranslationFieldUpdate,
)
from app.modules.localization.service import (
    FieldNotTranslatableError,
    LocalizationService,
)

router = APIRouter(
    prefix="/admin/localization",
    tags=["admin-localization"],
)

service = LocalizationService()


@router.get(
    "/locales",
    response_model=list[LocaleResponse],
)
def list_locales(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_locale_read),
) -> list[LocaleResponse]:
    return service.get_locales(db)


@router.patch(
    "/templates/{template_id}",
)
def update_template_localization(
    template_id: str,
    payload: LocalizationUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_locale_write),
) -> dict[str, Any]:
    try:
        result = service.upsert_template_localization(
            db=db,
            template_id=template_id,
            locale_code=payload.locale_code,
            name=payload.name,
            description=payload.description,
        )

        return {
            "id": result.id,
            "template_id": str(result.template_id),
            "locale_code": result.locale_code,
            "name": result.name,
            "description": result.description,
            "status": result.status,
        }
    except ValueError as exc:
        msg = str(exc)
        if "not found" in msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=msg,
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=msg,
        ) from exc


@router.get(
    "/templates/{template_id}",
)
def get_template_localizations(
    template_id: str,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_locale_read),
) -> list[dict[str, Any]]:
    try:
        items = service.get_template_localizations(db, template_id)
        return [
            {
                "id": item.id,
                "template_id": str(item.template_id),
                "locale_code": item.locale_code,
                "name": item.name,
                "description": item.description,
                "status": item.status,
            }
            for item in items
        ]
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.get(
    "/templates/{template_id}/completeness",
    response_model=LocalizationCompleteness,
)
def get_template_completeness(
    template_id: str,
    locale: str = Query(default="en"),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_locale_read),
) -> LocalizationCompleteness:
    try:
        data = service.get_template_completeness(db, template_id, locale)
        return LocalizationCompleteness(**data)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.patch(
    "/content/{entry_id}/fields/{field_key}",
)
def update_content_translation(
    entry_id: str,
    field_key: str,
    payload: TranslationFieldUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_locale_write),
) -> dict[str, Any]:
    try:
        loc = service.update_content_field_translation(
            db=db,
            entry_id=entry_id,
            field_key=field_key,
            locale_code=payload.locale_code,
            value=payload.value,
        )
        return {
            "id": loc.id,
            "content_entry_id": str(loc.content_entry_id),
            "locale_code": loc.locale_code,
            "field_key": loc.field_key,
            "value": loc.value,
            "status": loc.status,
        }
    except FieldNotTranslatableError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": "FIELD_NOT_TRANSLATABLE",
                "field_key": exc.field_key,
            },
        ) from exc
    except ValueError as exc:
        msg = str(exc)
        if "not found" in msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=msg,
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=msg,
        ) from exc
