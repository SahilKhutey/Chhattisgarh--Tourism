from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import (
    AdminUser,
    require_glossary_read,
    require_glossary_write,
)
from app.modules.glossary.schemas import (
    GlossaryCreate,
    GlossaryResponse,
    GlossaryTranslation,
    GlossaryUpdate,
)
from app.modules.glossary.service import GlossaryService

router = APIRouter(
    prefix="/admin/glossary",
    tags=["admin-glossary"],
)

service = GlossaryService()


def term_to_response(term: Any) -> GlossaryResponse:
    translations = []
    for item in getattr(term, "translations", []) or []:
        synonyms = []
        if item.synonyms:
            synonyms = [s.strip() for s in item.synonyms.split(",") if s.strip()]
        translations.append(
            GlossaryTranslation(
                locale_code=item.locale_code,
                term=item.term,
                synonyms=synonyms,
            )
        )
    return GlossaryResponse(
        id=term.id,
        key=term.key,
        definition=term.definition,
        context=term.context,
        preferred=term.preferred,
        deprecated=term.deprecated,
        translations=translations,
    )


@router.get(
    "",
    response_model=list[GlossaryResponse],
)
def list_glossary(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_glossary_read),
) -> list[GlossaryResponse]:
    terms = service.list(db)
    return [term_to_response(t) for t in terms]


@router.post(
    "",
    response_model=GlossaryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_glossary_term(
    payload: GlossaryCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_glossary_write),
) -> GlossaryResponse:
    try:
        term = service.create(db=db, payload=payload)
        return term_to_response(term)
    except ValueError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.patch(
    "/{term_id}",
    response_model=GlossaryResponse,
)
def update_glossary_term(
    term_id: int,
    payload: GlossaryUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_glossary_write),
) -> GlossaryResponse:
    try:
        term = service.update(db=db, term_id=term_id, payload=payload)
        return term_to_response(term)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.delete(
    "/{term_id}",
)
def delete_glossary_term(
    term_id: int,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_glossary_write),
) -> dict[str, bool]:
    success = service.delete(db=db, term_id=term_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Glossary term {term_id} not found.",
        )
    return {"success": True}
