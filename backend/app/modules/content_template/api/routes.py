from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db

from ..application.create_template import create_template
from ..application.get_template import get_template
from ..application.update_fields import replace_fields
from ..application.update_template import update_template
from ..domain.errors import (
    TemplateConcurrencyError,
    TemplateConflictError,
    TemplateNotFoundError,
    TemplateValidationError,
)
from ..infrastructure.repository import SQLAlchemyTemplateRepository
from ..schemas import (
    ReplaceFieldsInput,
    TemplateMetadataInput,
    UpdateTemplateInput,
)
from ..service import build_template_schema

router = APIRouter(
    prefix="/admin/templates",
    tags=["Admin Templates"],
)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
async def create(
    data: TemplateMetadataInput,
    session: AsyncSession = Depends(get_db),
):
    try:
        template = await create_template(session, data)
    except TemplateConflictError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
    except TemplateValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    return build_template_schema(template)


@router.get("")
async def list_templates(
    search: str | None = Query(default=None),
    status_filter: str = Query(
        default="ALL",
        alias="status",
    ),
    category: str = Query(default="ALL"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(
        default=25,
        ge=1,
        le=100,
    ),
    session: AsyncSession = Depends(get_db),
):
    repository = SQLAlchemyTemplateRepository(session)

    templates = await repository.list(
        search=search,
        status=status_filter,
        category=category,
        offset=(page - 1) * page_size,
        limit=page_size,
    )

    return {
        "items": [build_template_schema(template) for template in templates],
        "page": page,
        "pageSize": page_size,
    }


@router.get("/{template_id}")
async def get(
    template_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    try:
        template = await get_template(session, template_id)
    except TemplateNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    return build_template_schema(template)


@router.patch("/{template_id}")
async def update(
    template_id: UUID,
    data: UpdateTemplateInput,
    session: AsyncSession = Depends(get_db),
):
    try:
        template = await update_template(session, template_id, data)
    except TemplateNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except TemplateConcurrencyError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return build_template_schema(template)


@router.put("/{template_id}/fields")
async def update_fields(
    template_id: UUID,
    data: ReplaceFieldsInput,
    session: AsyncSession = Depends(get_db),
):
    try:
        template = await replace_fields(session, template_id, data)
        template = await get_template(session, template.id)
    except TemplateNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except TemplateConcurrencyError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
    except TemplateValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return build_template_schema(template)
