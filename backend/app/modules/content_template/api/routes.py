from fastapi import APIRouter, Depends, HTTPException, status

from ..schemas import TemplateMetadataInput
from ..application.create_template import CreateTemplateService

router = APIRouter(
    prefix="/admin/templates",
    tags=["Admin Templates"],
)


def get_create_template_service() -> CreateTemplateService:
    raise NotImplementedError(
        "Wire repository dependency in application bootstrap"
    )


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
async def create_template(
    data: TemplateMetadataInput,
    service: CreateTemplateService = Depends(
        get_create_template_service
    ),
):
    try:
        template = await service.execute(data)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    return template
