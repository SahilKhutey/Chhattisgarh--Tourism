from fastapi import (
    APIRouter,
    Depends,
    Query,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import (
    AdminUser,
    require_template_admin,
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
