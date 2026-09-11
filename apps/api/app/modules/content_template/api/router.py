import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.content_template.domain.exceptions import (
    TemplateAlreadyExistsError,
    TemplateNotFoundError,
    TemplatePublishError,
    TemplateValidationError,
)
from app.modules.content_template.schemas.field import (
    TemplateFieldPatchRequest,
)
from app.modules.content_template.schemas.template import (
    TemplateCreate,
    TemplateResponse,
)
from app.modules.content_template.services.schema_compiler import (
    compile_template,
)
from app.modules.content_template.services.template_service import (
    TemplateService,
)

router = APIRouter(
    prefix="/templates",
    tags=["templates"],
)

service = TemplateService()


@router.post(
    "",
    response_model=TemplateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_template(
    data: TemplateCreate,
    db: Session = Depends(get_db),
):
    try:
        template = service.create(
            db,
            data=data,
            actor_id=None,
        )

        db.commit()
        db.refresh(template)

        return template

    except TemplateAlreadyExistsError as exc:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail=str(exc),
        ) from exc


@router.get(
    "/{template_id}",
    response_model=TemplateResponse,
)
def get_template(
    template_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    try:
        return service.get(
            db,
            template_id,
        )

    except TemplateNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc


@router.patch(
    "/{template_id}/fields",
    response_model=TemplateResponse,
)
def update_fields(
    template_id: uuid.UUID,
    data: TemplateFieldPatchRequest,
    db: Session = Depends(get_db),
):
    try:
        template = service.update_fields(
            db,
            template_id,
            data,
            actor_id=None,
        )

        db.commit()
        db.refresh(template)

        return template

    except TemplateNotFoundError as exc:
        db.rollback()

        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except TemplatePublishError as exc:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail=str(exc),
        ) from exc

    except (TemplateValidationError, IntegrityError) as exc:
        db.rollback()

        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc


@router.post(
    "/{template_id}/publish",
    response_model=TemplateResponse,
)
def publish_template(
    template_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    try:
        template = service.publish(
            db,
            template_id,
            actor_id=None,
        )

        db.commit()
        db.refresh(template)

        return template

    except TemplateNotFoundError as exc:
        db.rollback()

        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except (TemplatePublishError, TemplateValidationError) as exc:
        db.rollback()

        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc


@router.get(
    "/{template_id}/compiled-schema",
)
def get_compiled_schema(
    template_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    try:
        template = service.get(
            db,
            template_id,
        )

        return compile_template(
            template
        )

    except TemplateNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc
