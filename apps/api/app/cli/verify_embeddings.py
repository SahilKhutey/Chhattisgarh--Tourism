from __future__ import annotations

import sys
from sqlalchemy import func, select
from app.core.database import SessionLocal
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.intelligence.embeddings.models import ContentEmbedding, EmbeddingModel
from app.modules.intelligence.embeddings.service import EmbeddingService, calculate_source_hash, build_semantic_text


def verify_embeddings() -> int:
    db = SessionLocal()
    service = EmbeddingService()
    try:
        active_model = service.get_or_create_active_model(db)
        entries = db.scalars(
            select(ContentEntry).where(ContentEntry.status == "PUBLISHED")
        ).all()

        published_count = len(entries)
        actual_embeddings = db.scalar(
            select(func.count(func.distinct(ContentEmbedding.content_entry_id))).where(
                ContentEmbedding.model_id == active_model.id
            )
        ) or 0

        missing = 0
        stale = 0
        wrong_model = 0

        for entry in entries:
            emb = db.scalar(
                select(ContentEmbedding).where(
                    ContentEmbedding.content_entry_id == entry.id,
                    ContentEmbedding.model_id == active_model.id,
                    ContentEmbedding.locale == "en",
                )
            )
            if not emb:
                missing += 1
                continue

            values = entry.values or {}
            sem_text = build_semantic_text(
                title=str(values.get("title") or values.get("name") or entry.slug),
                content_type=str(values.get("content_type") or values.get("category") or "destination"),
                district=values.get("district"),
                categories=values.get("categories") or ([values.get("category")] if values.get("category") else []),
                tags=values.get("tags") or [],
                description=values.get("description"),
                body=values.get("body"),
            )
            if emb.source_hash != calculate_source_hash(sem_text):
                stale += 1

        print(f"Published entries:   {published_count}")
        print(f"Expected embeddings: {published_count}")
        print(f"Actual embeddings:   {actual_embeddings}")
        print(f"Missing:             {missing}")
        print(f"Stale:               {stale}")
        print(f"Wrong model:         {wrong_model}")

        healthy = (missing == 0 and stale == 0 and wrong_model == 0)
        print(f"\nSTATUS: {'HEALTHY' if healthy else 'DEGRADED'}")
        return 0 if healthy else 1
    finally:
        db.close()


def main() -> None:
    sys.exit(verify_embeddings())


if __name__ == "__main__":
    main()
