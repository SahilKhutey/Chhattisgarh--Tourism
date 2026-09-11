from __future__ import annotations

import sys
from app.core.database import SessionLocal
from app.modules.search.indexer import SearchIndexer


def main() -> None:
    print("Loading published content...")
    db = SessionLocal()
    try:
        indexer = SearchIndexer()
        indexed_count, removed_count = indexer.rebuild_all(db)
        print(f"Indexed {indexed_count:,} entries.")
        print(f"Removed {removed_count:,} stale documents.")
        print("Completed successfully.")
    except Exception as exc:
        print(f"Error rebuilding search index: {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
