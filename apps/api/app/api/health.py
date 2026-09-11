from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.database_health import database_health
from app.core.redis import redis_health

router = APIRouter(
    prefix="/health",
    tags=["health"],
)


@router.get("")
def health(db: Session = Depends(get_db)):
    database = database_health(db)
    redis = redis_health()

    healthy = database.get("healthy", False) and redis.get("healthy", False)

    return {
        "status": "healthy" if healthy else "degraded",
        "database": database,
        "redis": redis,
    }
