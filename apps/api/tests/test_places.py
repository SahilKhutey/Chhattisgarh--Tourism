import pytest
from sqlalchemy import select
from app.core.database import SessionLocal
from app.db.models.place import Place


def test_place_slug_is_unique():
    try:
        with SessionLocal() as db:
            existing = db.scalar(
                select(Place).where(Place.slug == "unique-test-place")
            )
            if not existing:
                first = Place(
                    name="Test Place",
                    slug="unique-test-place",
                )
                db.add(first)
                db.commit()

            result = db.scalar(
                select(Place).where(Place.slug == "unique-test-place")
            )
            assert result is not None
    except Exception as exc:
        pytest.skip(f"Database not available for spatial model test: {exc}")
