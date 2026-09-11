from typing import Any
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import (
    AdminUser,
    require_template_admin,
    require_template_publish,
    require_template_read,
    require_template_rollback,
    require_template_write,
)
from app.modules.admin.schemas.template_builder import (
    TemplateDraftUpdate,
    TemplateFieldsUpdate,
    TemplateMetadataUpdate,
)
from app.modules.admin.schemas.template_versions import (
    RollbackRequest,
    TemplateVersionListResponse,
    TemplateVersionResponse,
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
    return service.format_template_for_builder(template, db=db)


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
    return service.format_template_for_builder(template, db=db)


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
    return service.format_template_for_builder(template, db=db)


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
    return service.format_template_for_builder(template, db=db)


@router.post(
    "/{template_id}/draft",
)
def unlock_draft(
    template_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_template_write),
):
    template = service.get_template(db, template_id)
    service.unlock_draft(db, template, actor_id=user.id)
    db.commit()
    return service.format_template_for_builder(template, db=db)


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
    response_model=TemplateVersionResponse,
)
def publish_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_template_publish),
):
    template = service.repository.get_for_update(db, template_id)
    if template is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found.",
        )
    try:
        version = service.publish_template(db, template, actor_id=user.id)
        db.commit()
    except Exception:
        db.rollback()
        raise
    return service.format_version(version)


@router.post(
    "/{template_id}/rollback",
    response_model=TemplateVersionResponse,
)
def rollback_template(
    template_id: UUID,
    payload: RollbackRequest,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_template_rollback),
):
    template = service.repository.get_for_update(db, template_id)
    if template is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found.",
        )
    try:
        version = service.rollback_template(
            db, template, payload.version_number, actor_id=user.id
        )
        db.commit()
    except Exception:
        db.rollback()
        raise
    return service.format_version(version)


@router.get(
    "/{template_id}/versions",
    response_model=TemplateVersionListResponse,
)
def list_versions(
    template_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_template_read),
):
    return service.list_versions(db, template_id)


@router.get(
    "/{template_id}/versions/{version_number}",
    response_model=TemplateVersionResponse,
)
def get_version(
    template_id: UUID,
    version_number: int,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_template_read),
):
    version = service.get_version_detail(db, template_id, version_number)
    return service.format_version(version)


@router.get(
    "/{template_id}/versions/{version_number}/diff",
)
def diff_version(
    template_id: UUID,
    version_number: int,
    against: str = Query(default="previous"),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_template_read),
):
    return service.diff_version(db, template_id, version_number, against=against)

