"""Public Tourism Content Subsystem (P10)"""
from .api import router as public_content_router
from .service import PublicContentService

__all__ = ["public_content_router", "PublicContentService"]
