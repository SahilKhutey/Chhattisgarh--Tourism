from sqlalchemy import text
from sqlalchemy.orm import Session


def database_health(db: Session) -> dict:
    try:
        result = db.execute(text("SELECT 1")).scalar_one()
        return {
            "healthy": result == 1,
        }
    except Exception as exc:
        return {
            "healthy": False,
            "error": str(exc),
        }
