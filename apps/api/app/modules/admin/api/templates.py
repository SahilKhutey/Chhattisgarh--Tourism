from typing import Any
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    Query,
    status,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import (
    AdminUser,
    require_template_admin,
    require_template_write,
)
from app.modules.admin.schemas.template_builder import (
    TemplateDraftUpdate,
    TemplateFieldsUpdate,
    TemplateMetadataUpdate,
)
from app.modules.admin.schemas.templates import (
    AdminTemplateListResponse,
)
from app.modules.admin.services import (
    AdminTemplateService,
)

router = APIRouter(
    prefix="/admin/templates",
    tags=["admin-templates"],
)

service = AdminTemplateService()


@router.get(
    "",
    response_model=AdminTemplateListResponse,
)
def list_templates(
    search: str | None = Query(
        default=None,
        max_length=100,
    ),
    template_status: str | None = Query(
        default=None,
        alias="status",
    ),
    category: str | None = Query(
        default=None,
        max_length=100,
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_template_admin),
):
    return service.list_templates(
        db,
        search=search,
        status=template_status,
        category=category,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{template_id}",
)
def get_template_for_builder(
    template_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_template_admin),
):
    template = service.get_template(db, template_id)
    return service.format_template_for_builder(template)


@router.patch(
    "/{template_id}",
)
def update_template_metadata(
    template_id: UUID,
    payload: TemplateMetadataUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_template_write),
):
    template = service.get_template(db, template_id)
    service.update_metadata(db, template, payload, actor_id=user.id)
    db.commit()
    return service.format_template_for_builder(template)


@router.patch(
    "/{template_id}/fields",
)
def update_template_fields(
    template_id: UUID,
    payload: TemplateFieldsUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_template_write),
):
    template = service.get_template(db, template_id)
    service.replace_fields(db, template, payload.fields, actor_id=user.id)
    db.commit()
    return service.format_template_for_builder(template)


@router.patch(
    "/{template_id}/draft",
)
def update_draft(
    template_id: UUID,
    payload: TemplateDraftUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_template_write),
):
    template = service.get_template(db, template_id)
    service.update_draft(db, template, payload, actor_id=user.id)
    db.commit()
    return service.format_template_for_builder(template)


@router.post(
    "/{template_id}/validate",
)
def validate_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_template_admin),
):
    template = service.get_template(db, template_id)
    return service.validate_template(db, template)


@router.post(
    "/{template_id}/publish",
)
def publish_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_template_write),
):
    template = service.get_template(db, template_id)
    service.publish_template(db, template, actor_id=user.id)
    db.commit()
    return service.format_template_for_builder(template)
