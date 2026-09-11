import pytest
from sqlalchemy import text
from app.core.database import engine


def test_postgis_available():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT PostGIS_Version()")).scalar_one()
        assert result is not None
    except Exception as exc:
        pytest.skip(f"PostGIS not available in current environment: {exc}")
