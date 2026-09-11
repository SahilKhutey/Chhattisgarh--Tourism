from __future__ import annotations

import sys
from sqlalchemy import select
from app.core.database import SessionLocal
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.search.models import SearchDocument


def verify_index() -> int:
    db = SessionLocal()
    try:
        published_entries = list(
            db.scalars(
                select(ContentEntry).where(ContentEntry.status == "PUBLISHED")
            )
        )
        published_ids = {entry.id for entry in published_entries}

        indexed_docs = list(db.scalars(select(SearchDocument)))
        indexed_entry_ids = {doc.content_entry_id for doc in indexed_docs}

        # Calculate counts
        published_count = len(published_entries)
        indexed_count = len(indexed_entry_ids)

        missing_count = len(published_ids - indexed_entry_ids)
        orphan_count = sum(1 for doc in indexed_docs if doc.content_entry_id not in published_ids)

        # Check stale documents (e.g. status changed away from PUBLISHED)
        all_entries_by_id = {
            e.id: e for e in db.scalars(select(ContentEntry))
        }
        stale_count = 0
        for doc in indexed_docs:
            entry = all_entries_by_id.get(doc.content_entry_id)
            if entry and entry.status != "PUBLISHED":
                stale_count += 1

        is_healthy = missing_count == 0 and stale_count == 0 and orphan_count == 0

        print("Search Index Integrity")
        print("----------------------")
        print(f"Published entries:        {published_count}")
        print(f"Indexed entries:          {indexed_count}")
        print(f"Missing:                  {missing_count}")
        print(f"Stale:                    {stale_count}")
        print(f"Orphans:                  {orphan_count}")
        print("")
        print(f"STATUS: {'HEALTHY' if is_healthy else 'FAIL'}")

        return 0 if is_healthy else 1
    finally:
        db.close()


def main() -> None:
    code = verify_index()
    sys.exit(code)


if __name__ == "__main__":
    main()
