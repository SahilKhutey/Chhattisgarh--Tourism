from __future__ import annotations

import argparse
import sys
from sqlalchemy import select
from app.core.database import SessionLocal
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.intelligence.embeddings.models import ContentEmbedding
from app.modules.intelligence.embeddings.service import EmbeddingService, calculate_source_hash, build_semantic_text


def rebuild_embeddings(batch_size: int = 50, dry_run: bool = False) -> int:
    service = EmbeddingService()
    db = SessionLocal()
    try:
        active_model = service.get_or_create_active_model(db)
        entries = db.scalars(
            select(ContentEntry).where(ContentEntry.status == "PUBLISHED")
        ).all()

        total_published = len(entries)
        existing_count = db.scalar(
            select(ContentEmbedding).where(ContentEmbedding.model_id == active_model.id)
        )
        existing_vectors = db.query(ContentEmbedding).filter(ContentEmbedding.model_id == active_model.id).count()

        generated = 0
        skipped = 0
        failed = 0

        for entry in entries:
            try:
                # Check source hash
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
                curr_hash = calculate_source_hash(sem_text)
                existing = db.scalar(
                    select(ContentEmbedding).where(
                        ContentEmbedding.content_entry_id == entry.id,
                        ContentEmbedding.model_id == active_model.id,
                        ContentEmbedding.locale == "en",
                    )
                )
                if existing and existing.source_hash == curr_hash:
                    skipped += 1
                    continue

                if not dry_run:
                    service.index_entry(db, entry, locale="en")
                    db.commit()
                generated += 1
            except Exception as ex:
                failed += 1
                db.rollback()

        print("Embedding rebuild")
        print("-----------------")
        print(f"Published entries: {total_published}")
        print(f"Existing vectors:  {existing_vectors}")
        print(f"Generated:         {generated}")
        print(f"Skipped:           {skipped}")
        print(f"Failed:            {failed}")
        print("\nSTATUS: SUCCESS" if failed == 0 else "\nSTATUS: FAILED")

        return 0 if failed == 0 else 1
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Rebuild semantic embeddings for published entries")
    parser.add_argument("--batch-size", type=int, default=50)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    sys.exit(rebuild_embeddings(batch_size=args.batch_size, dry_run=args.dry_run))


if __name__ == "__main__":
    main()
