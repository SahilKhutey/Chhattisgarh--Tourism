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

    intelligence_health = {
        "embedding_model": "none",
        "embedding_coverage": 1.0,
        "graph_entities": 0,
        "graph_relationships": 0,
        "semantic_search": "HEALTHY",
        "recommendations": "HEALTHY",
    }
    try:
        from app.modules.intelligence.embeddings.models import ContentEmbedding, EmbeddingModel
        from app.modules.intelligence.knowledge_graph.models import GraphEntity, GraphRelationship

        active_model = db.scalar(
            select(EmbeddingModel).where(EmbeddingModel.is_active.is_(True)).order_by(EmbeddingModel.created_at.desc())
        )
        if active_model:
            intelligence_health["embedding_model"] = active_model.model_name
            embedded_count = db.scalar(
                select(func.count(func.distinct(ContentEmbedding.content_entry_id))).where(
                    ContentEmbedding.model_id == active_model.id
                )
            ) or 0
            if published_count > 0:
                coverage = round(embedded_count / published_count, 4)
                intelligence_health["embedding_coverage"] = coverage
                if coverage < 0.95:
                    intelligence_health["semantic_search"] = "DEGRADED"

        intelligence_health["graph_entities"] = db.scalar(select(func.count(GraphEntity.id))) or 0
        intelligence_health["graph_relationships"] = db.scalar(select(func.count(GraphRelationship.id))) or 0
    except Exception:
        intelligence_health["semantic_search"] = "UNKNOWN"

    return {
        "status": "healthy" if healthy else "degraded",
        "database": database,
        "redis": redis,
        "search": search_health,
        "intelligence": intelligence_health,
    }
