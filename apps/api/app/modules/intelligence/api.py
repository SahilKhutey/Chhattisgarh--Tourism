from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.search.models import SearchDocument
from .cache import IntelligenceCache
from .embeddings.models import ContentEmbedding, EmbeddingModel
from .embeddings.service import EmbeddingService
from .knowledge_graph.repository import KnowledgeGraphRepository
from .knowledge_graph.schemas import PublicContextResponse
from .knowledge_graph.service import KnowledgeGraphService
from .query.intent import IntentClassifier
from .recommendations.schemas import Recommendation, RecommendationResponse
from .recommendations.service import RecommendationService
from .semantic_search.schemas import DiscoveryResponse, HybridSearchItem, HybridSearchResponse
from .semantic_search.service import SemanticSearchService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["intelligence"])


@router.get("/discover", response_model=DiscoveryResponse)
def discover(
    q: str = Query(default="", description="Search or discovery query"),
    locale: str = Query(default="en", pattern="^(en|hi|chg)$"),
    district: str | None = Query(default=None),
    category: str | None = Query(default=None),
    latitude: float | None = Query(default=None, ge=-90, le=90),
    longitude: float | None = Query(default=None, ge=-180, le=180),
    radius_km: float | None = Query(default=None, gt=0, le=500),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Primary discovery landing API combining semantic query understanding,
    hybrid search, category exploration, and contextual recommendations.
    """
    classifier = IntentClassifier()
    detected_intent = classifier.classify(q) if q else None

    search_service = SemanticSearchService()
    search_resp = search_service.search(
        db=db,
        query=q,
        locale=locale,
        district=district,
        category=category,
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km,
        page=page,
        page_size=page_size,
        mode="hybrid",
    )

    suggested_queries: list[str] = []
    if detected_intent:
        if detected_intent.value == "nature":
            suggested_queries = ["waterfalls in Bastar", "quiet forest stays", "scenic valley drives"]
        elif detected_intent.value == "spiritual":
            suggested_queries = ["ancient Shiva temples", "Sirpur monasteries", "pilgrimage circuit"]
        elif detected_intent.value == "wildlife":
            suggested_queries = ["tiger safari", "Barnawapara sanctuary", "Kanger valley birds"]
        elif detected_intent.value == "heritage":
            suggested_queries = ["Bhoramdeo architecture", "Sirpur excavations", "Bastar tribal crafts"]
        else:
            suggested_queries = ["popular destinations", "nature retreats", "family friendly spots"]
    else:
        suggested_queries = ["waterfalls in Bastar", "peaceful nature places", "historical temples"]

    related_categories: list[str] = [
        "Waterfalls", "Temples", "Wildlife", "Heritage", "Forests", "Adventure", "Tribal Culture"
    ]

    # Curated recommendations for discovery
    popular_docs = db.scalars(
        select(SearchDocument).where(
            SearchDocument.locale == locale,
            SearchDocument.is_published.is_(True),
        ).order_by(SearchDocument.popularity_score.desc()).limit(4)
    ).all()

    recommendations = [
        Recommendation(
            id=str(d.content_entry_id),
            slug=d.slug,
            title=d.title,
            content_type=d.content_type,
            district=d.district,
            category=d.categories[0] if d.categories else None,
            reason="Featured destination",
            score=1.0,
            thumbnail_url=getattr(d, "thumbnail_url", None),
        )
        for d in popular_docs
    ]

    return DiscoveryResponse(
        query=q or None,
        intent=detected_intent.value if detected_intent else None,
        results=search_resp.items,
        suggested_queries=suggested_queries,
        related_categories=related_categories,
        recommendations=recommendations,
    )


@router.get("/content/{slug}/similar", response_model=list[HybridSearchItem])
def get_similar_content(
    slug: str,
    locale: str = Query(default="en", pattern="^(en|hi|chg)$"),
    limit: int = Query(default=6, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """
    Finds semantically similar published content via nearest-neighbor vector embeddings.
    """
    entry = db.scalar(select(ContentEntry).where(ContentEntry.slug == slug, ContentEntry.status == "PUBLISHED"))
    if not entry:
        raise HTTPException(status_code=404, detail=f"Published content '{slug}' not found")

    embedding_service = EmbeddingService()
    active_model = embedding_service.get_or_create_active_model(db)
    current_emb = db.scalar(
        select(ContentEmbedding).where(
            ContentEmbedding.content_entry_id == entry.id,
            ContentEmbedding.model_id == active_model.id,
            ContentEmbedding.locale == locale,
        )
    )

    if not current_emb or not current_emb.embedding:
        return []

    semantic_repo = SemanticSearchService().semantic_repository
    candidates = semantic_repo.find_nearest_candidates(
        db=db,
        query_vector=list(current_emb.embedding),
        model_id=active_model.id,
        locale=locale,
        limit=limit + 1,
        similarity_threshold=0.5,
    )

    results: list[HybridSearchItem] = []
    for c in candidates:
        if c.content_entry_id == str(entry.id):
            continue
        doc = db.scalar(
            select(SearchDocument).where(
                SearchDocument.content_entry_id == UUID(c.content_entry_id),
                SearchDocument.locale == locale,
                SearchDocument.is_published.is_(True),
            )
        )
        if doc:
            results.append(
                HybridSearchItem(
                    id=str(doc.content_entry_id),
                    slug=doc.slug,
                    title=doc.title,
                    content_type=doc.content_type,
                    district=doc.district,
                    categories=doc.categories or [],
                    tags=doc.tags or [],
                    description=doc.description,
                    thumbnail_url=getattr(doc, "thumbnail_url", None),
                    latitude=doc.latitude,
                    longitude=doc.longitude,
                    score=c.similarity,
                    semantic_score=c.similarity,
                    hybrid_score=c.similarity,
                    match_reason=f"Similar experience to {entry.slug}",
                )
            )
        if len(results) >= limit:
            break

    return results


@router.get("/content/{slug}/recommendations", response_model=RecommendationResponse)
def get_recommendations(
    slug: str,
    locale: str = Query(default="en", pattern="^(en|hi|chg)$"),
    limit: int = Query(default=8, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """
    Returns explainable, diverse recommendations for a published destination.
    """
    entry = db.scalar(select(ContentEntry).where(ContentEntry.slug == slug, ContentEntry.status == "PUBLISHED"))
    if not entry:
        raise HTTPException(status_code=404, detail=f"Published content '{slug}' not found")

    cache = IntelligenceCache()
    cached = cache.get_recommendations(str(entry.id), locale)
    if cached is not None:
        return RecommendationResponse(
            source_content_id=str(entry.id),
            recommendations=[Recommendation(**r) for r in cached[:limit]],
        )

    rec_service = RecommendationService()
    recs = rec_service.recommend(db=db, content_entry_id=entry.id, locale=locale, limit=limit)

    cache.set_recommendations(str(entry.id), locale, [r.model_dump() for r in recs])

    return RecommendationResponse(
        source_content_id=str(entry.id),
        recommendations=recs,
    )


@router.get("/content/{slug}/related", response_model=RecommendationResponse)
def get_related_content(
    slug: str,
    locale: str = Query(default="en", pattern="^(en|hi|chg)$"),
    limit: int = Query(default=6, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """Alias to recommendation endpoint for related content cards."""
    return get_recommendations(slug=slug, locale=locale, limit=limit, db=db)


@router.get("/content/{slug}/context", response_model=PublicContextResponse)
def get_content_context(
    slug: str,
    locale: str = Query(default="en", pattern="^(en|hi|chg)$"),
    db: Session = Depends(get_db),
):
    """
    Safe public knowledge graph context: returns located_in, categories, activities,
    and nearby attractions without exposing internal IDs.
    """
    kg_service = KnowledgeGraphService()
    ctx = kg_service.get_content_context(db=db, slug=slug, locale=locale)
    if not ctx:
        raise HTTPException(status_code=404, detail=f"Context for '{slug}' not found")
    return ctx


# ---------------- Admin Intelligence Endpoints ----------------

admin_router = APIRouter(prefix="/admin/intelligence", tags=["admin-intelligence"])


@admin_router.get("/health")
def get_intelligence_health(db: Session = Depends(get_db)):
    """Reports embedding coverage, graph entities, and intelligence subsystem health."""
    published_count = db.scalar(
        select(func.count()).select_from(ContentEntry).where(ContentEntry.status == "PUBLISHED")
    ) or 0

    active_model = db.scalar(
        select(EmbeddingModel).where(EmbeddingModel.is_active.is_(True)).order_by(EmbeddingModel.created_at.desc())
    )

    embedded_count = 0
    if active_model:
        embedded_count = db.scalar(
            select(func.count(func.distinct(ContentEmbedding.content_entry_id))).where(
                ContentEmbedding.model_id == active_model.id
            )
        ) or 0

    coverage = round(embedded_count / published_count, 4) if published_count > 0 else 1.0

    kg_repo = KnowledgeGraphRepository()
    entity_count = kg_repo.count_entities(db)
    rel_count = kg_repo.count_relationships(db)

    return {
        "intelligence": {
            "embedding_model": active_model.model_name if active_model else "none",
            "embedding_coverage": coverage,
            "embedded_count": embedded_count,
            "published_count": published_count,
            "graph_entities": entity_count,
            "graph_relationships": rel_count,
            "semantic_search": "HEALTHY" if coverage >= 0.95 else "DEGRADED",
            "recommendations": "HEALTHY",
        }
    }


@admin_router.get("/embeddings")
def get_embeddings_status(db: Session = Depends(get_db)):
    active_model = db.scalar(
        select(EmbeddingModel).where(EmbeddingModel.is_active.is_(True)).order_by(EmbeddingModel.created_at.desc())
    )
    total_vectors = db.scalar(select(func.count()).select_from(ContentEmbedding)) or 0
    return {
        "active_model": active_model.model_name if active_model else None,
        "dimension": active_model.dimension if active_model else 1024,
        "total_vectors": total_vectors,
    }


@admin_router.get("/graph")
def get_graph_status(db: Session = Depends(get_db)):
    kg_repo = KnowledgeGraphRepository()
    return {
        "entities": kg_repo.count_entities(db),
        "relationships": kg_repo.count_relationships(db),
        "unresolved_aliases": 0,
    }


@admin_router.post("/rebuild")
def rebuild_intelligence(
    target: str = Query(default="all", pattern="^(embeddings|graph|all)$"),
    db: Session = Depends(get_db),
):
    """Admin-only endpoint to trigger incremental intelligence re-indexing."""
    published_entries = db.scalars(
        select(ContentEntry).where(ContentEntry.status == "PUBLISHED")
    ).all()

    emb_generated = 0
    graph_entities_created = 0

    if target in ("embeddings", "all"):
        emb_service = EmbeddingService()
        for entry in published_entries:
            res = emb_service.index_entry(db, entry)
            if res:
                emb_generated += 1

    if target in ("graph", "all"):
        kg_service = KnowledgeGraphService()
        for entry in published_entries:
            res = kg_service.build_for_entry(db, entry)
            if res:
                graph_entities_created += 1

    return {
        "status": "SUCCESS",
        "target": target,
        "published_entries_processed": len(published_entries),
        "embeddings_indexed": emb_generated,
        "graph_entries_indexed": graph_entities_created,
    }
