from redis import Redis

from app.core.config import get_settings

settings = get_settings()

redis_client = Redis.from_url(
    settings.redis_url,
    decode_responses=True,
    health_check_interval=30,
    socket_connect_timeout=2,
    socket_timeout=2,
)


def redis_health() -> dict:
    try:
        result = redis_client.ping()
        return {
            "healthy": result is True,
        }
    except Exception as exc:
        return {
            "healthy": False,
            "error": str(exc),
        }
