from sqlalchemy import select

from app.core.database import SessionLocal
from app.db.models.place import Place
from .places import PLACES


def seed_places(db) -> int:
    added = 0
    for item in PLACES:
        existing = db.scalar(
            select(Place).where(
                Place.slug == item["slug"]
            )
        )

        if existing:
            continue

        db.add(Place(**item))
        added += 1
    return added


def run() -> None:
    with SessionLocal() as db:
        try:
            count = seed_places(db)
            db.commit()
            print(f"Database seed executed successfully: {count} new place(s) seeded.")
        except Exception:
            db.rollback()
            raise


if __name__ == "__main__":
    run()
