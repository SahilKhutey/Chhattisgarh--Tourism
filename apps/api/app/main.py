from fastapi import FastAPI

from app.api.health import router as health_router
from app.core.config import get_settings
from app.modules.content_template.api.router import (
    router as template_router,
)
from app.modules.admin.api.templates import (
    router as admin_template_router,
)
from app.modules.content_entries.api import (
    admin_content_router,
    admin_schema_router,
    public_content_router,
)
from app.modules.admin.api.localization import router as admin_localization_router
from app.modules.admin.api.glossary import router as admin_glossary_router
from app.modules.admin.api.accessibility import router as admin_accessibility_router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    debug=settings.app_debug,
)

app.include_router(health_router)
app.include_router(template_router, prefix="/api")
app.include_router(admin_template_router, prefix="/api")
app.include_router(admin_content_router, prefix="/api")
app.include_router(admin_schema_router, prefix="/api")
app.include_router(public_content_router, prefix="/api")
app.include_router(admin_localization_router, prefix="/api")
app.include_router(admin_glossary_router, prefix="/api")
app.include_router(admin_accessibility_router, prefix="/api")



@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": settings.app_name,
        "environment": settings.app_env,
        "status": "running",
    }
