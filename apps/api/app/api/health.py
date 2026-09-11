from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.database_health import database_health
from app.core.redis import redis_health

router = APIRouter(
    prefix="/health",
    tags=["health"],
)


@router.get("")
def health(db: Session = Depends(get_db)):
    database = database_health(db)
    redis = redis_health()

    healthy = database.get("healthy", False) and redis.get("healthy", False)

    search_health = {
        "indexed_documents": 0,
        "published_entries": 0,
        "missing_documents": 0,
        "stale_documents": 0,
        "index_health": "HEALTHY",
    }
    try:
        from sqlalchemy import func, select
        from app.modules.content_entries.models.content_entry import ContentEntry
        from app.modules.search.models import SearchDocument

        published_count = db.scalar(
            select(func.count()).select_from(ContentEntry).where(ContentEntry.status == "PUBLISHED")
        ) or 0
        indexed_count = db.scalar(
            select(func.count()).select_from(SearchDocument)
        ) or 0

        search_health["published_entries"] = published_count
        search_health["indexed_documents"] = indexed_count
        if published_count > 0 and indexed_count == 0:
            search_health["index_health"] = "DEGRADED"
    except Exception:
        search_health["index_health"] = "UNKNOWN"

    return {
        "status": "healthy" if healthy else "degraded",
        "database": database,
        "redis": redis,
        "search": search_health,
    }
