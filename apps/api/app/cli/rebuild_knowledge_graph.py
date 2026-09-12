from __future__ import annotations

import argparse
import sys
from sqlalchemy import select
from app.core.database import SessionLocal
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.intelligence.knowledge_graph.service import KnowledgeGraphService


def rebuild_knowledge_graph(dry_run: bool = False) -> int:
    service = KnowledgeGraphService()
    db = SessionLocal()
    try:
        entries = db.scalars(
            select(ContentEntry).where(ContentEntry.status == "PUBLISHED")
        ).all()

        entities_created = 0
        relationships_created = 0
        relationships_skipped = 0
        unresolved_aliases = 0

        for entry in entries:
            try:
                if not dry_run:
                    ent, rels = service.build_for_entry(db, entry, locale="en") or (None, [])
                    if ent:
                        entities_created += 1
                        relationships_created += len(rels)
                    db.commit()
            except Exception:
                db.rollback()
                relationships_skipped += 1

        print("Knowledge Graph rebuild")
        print("------------------------")
        print(f"Entities created:       {entities_created}")
        print(f"Relationships created:  {relationships_created}")
        print(f"Relationships skipped:  {relationships_skipped}")
        print(f"Unresolved aliases:     {unresolved_aliases}")
        print("\nSTATUS: SUCCESS" if relationships_skipped == 0 else "\nSTATUS: DEGRADED")

        return 0 if relationships_skipped == 0 else 1
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Rebuild Tourism Knowledge Graph from published entries")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    sys.exit(rebuild_knowledge_graph(dry_run=args.dry_run))


if __name__ == "__main__":
    main()
