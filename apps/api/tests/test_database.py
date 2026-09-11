import pytest
from sqlalchemy import text
from app.core.database import engine


def test_database_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1")).scalar_one()
        assert result == 1
    except Exception as exc:
        pytest.skip(f"PostgreSQL not reachable in current environment: {exc}")
