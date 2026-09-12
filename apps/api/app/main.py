from __future__ import annotations

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api.health import router as legacy_health_router
from app.core.config import get_settings
from app.core.database import get_db
from app.core.errors import AppError, app_error_handler
from app.core.health import readiness, detailed_admin_health
from app.core.logging import RequestContextMiddleware
from app.modules.content_template.api.router import router as template_router
from app.modules.admin.api.templates import router as admin_template_router
from app.modules.content_entries.api import (
    admin_content_router,
    admin_schema_router,
)
from app.modules.intelligence import intelligence_router, admin_intelligence_router
from app.modules.public_content import public_content_router
from app.modules.search import search_router
from app.modules.admin.api.localization import router as admin_localization_router
from app.modules.admin.api.glossary import router as admin_glossary_router
from app.modules.admin.api.accessibility import router as admin_accessibility_router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)

# 1. Exception handlers
app.add_exception_handler(AppError, app_error_handler)

# 2. Middlewares
app.add_middleware(RequestContextMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "If-Match",
        "X-Request-ID",
        "X-User-Role",
        "X-User-ID",
    ],
)

# 3. Operational Health Endpoints
@app.get("/health/live", tags=["health"])
def liveness() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "cg-tourism-api",
    }


@app.get("/health/ready", tags=["health"])
def readiness_check(db: Session = Depends(get_db)) -> dict:
    return readiness(db)


@app.get("/api/admin/health", tags=["admin-health"])
def admin_health_check(db: Session = Depends(get_db)) -> dict:
    return detailed_admin_health(db)


# 4. Routers Integration
app.include_router(legacy_health_router)
app.include_router(template_router, prefix="/api")
app.include_router(admin_template_router, prefix="/api")

# Mount admin content at both canonical prefixes
app.include_router(admin_content_router, prefix="/api")
app.include_router(admin_content_router, prefix="/api/admin/content")

app.include_router(admin_schema_router, prefix="/api")
app.include_router(intelligence_router, prefix="/api")
app.include_router(admin_intelligence_router, prefix="/api")
app.include_router(public_content_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(admin_localization_router, prefix="/api")
app.include_router(admin_glossary_router, prefix="/api")
app.include_router(admin_accessibility_router, prefix="/api")


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "CG Tourism API",
        "name": settings.app_name,
        "environment": settings.app_env,
        "status": "running",
    }
