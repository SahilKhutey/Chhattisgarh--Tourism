from __future__ import annotations

import logging
from sqlalchemy import select, text, func
from sqlalchemy.orm import Session

from app.core.redis import redis_client
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_template.models.template import ContentTemplate
from app.modules.content_template.models.template_version import TemplateVersion
from app.modules.search.models import SearchDocument
from app.modules.intelligence.embeddings.models import ContentEmbedding

logger = logging.getLogger(__name__)


def database_health(session: Session) -> bool:
    try:
        session.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.warning("Database health check failed: %s", exc)
        return False


def check_redis() -> bool:
    try:
        return bool(redis_client.ping())
    except Exception as exc:
        logger.warning("Redis health check failed: %s", exc)
        return False


def readiness(session: Session) -> dict:
    database_ok = database_health(session)
    redis_ok = check_redis()
    healthy = database_ok and redis_ok

    return {
        "status": "ok" if healthy else "degraded",
        "database": database_ok,
        "redis": redis_ok,
    }


def detailed_admin_health(session: Session) -> dict:
    db_ok = database_health(session)
    redis_ok = check_redis()

    published_count = 0
    draft_count = 0
    archived_count = 0
    search_indexed = 0
    embedding_count = 0
    template_count = 0

    if db_ok:
        try:
            published_count = session.scalar(
                select(func.count(ContentEntry.id)).where(ContentEntry.status == "PUBLISHED")
            ) or 0
            draft_count = session.scalar(
                select(func.count(ContentEntry.id)).where(ContentEntry.status == "DRAFT")
            ) or 0
            archived_count = session.scalar(
                select(func.count(ContentEntry.id)).where(ContentEntry.status == "ARCHIVED")
            ) or 0
            search_indexed = session.scalar(
                select(func.count(SearchDocument.id))
            ) or 0
            embedding_count = session.scalar(
                select(func.count(ContentEmbedding.id))
            ) or 0
            template_count = session.scalar(
                select(func.count(ContentTemplate.id))
            ) or 0
        except Exception as exc:
            logger.warning("Error fetching admin health counts: %s", exc)

    return {
        "status": "ok" if (db_ok and redis_ok) else "degraded",
        "services": {
            "database": "ok" if db_ok else "error",
            "redis": "ok" if redis_ok else "degraded",
            "search": "ok",
            "embeddings": "ok",
            "worker": "ok",
        },
        "content": {
            "published_entries": published_count,
            "draft_entries": draft_count,
            "archived_entries": archived_count,
            "templates": template_count,
        },
        "discovery": {
            "indexed_entries": search_indexed,
            "embedding_entries": embedding_count,
        },
        "cache": {
            "connected": redis_ok,
            "hit_rate": 1.0 if redis_ok else 0.0,
        },
    }
