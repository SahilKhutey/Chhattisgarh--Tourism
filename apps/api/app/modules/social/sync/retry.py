from __future__ import annotations

import asyncio
import logging
import random
from typing import Any, Awaitable, Callable, TypeVar
import httpx

from app.modules.social.providers.youtube.errors import (
    TransientProviderError,
    YouTubeRateLimitError,
    YouTubeUnavailableError,
)

logger = logging.getLogger(__name__)

T = TypeVar("T")

DEFAULT_TRANSIENT_EXCEPTIONS = (
    TransientProviderError,
    YouTubeRateLimitError,
    YouTubeUnavailableError,
    httpx.TimeoutException,
    httpx.NetworkError,
)


async def retry_with_backoff(
    operation: Callable[[], Awaitable[T]],
    *,
    attempts: int = 3,
    base_delay: float = 1.0,
    transient_exceptions: tuple[type[Exception], ...] = DEFAULT_TRANSIENT_EXCEPTIONS,
) -> T:
    """
    Executes an asynchronous operation with exponential backoff and randomized jitter
    for transient provider errors.
    """
    last_error: Exception | None = None

    for attempt in range(attempts):
        try:
            return await operation()
        except transient_exceptions as exc:
            last_error = exc
            if attempt == attempts - 1:
                logger.warning(
                    "All %d retry attempts exhausted. Final error: %s",
                    attempts,
                    exc,
                )
                raise

            delay = base_delay * (2 ** attempt)
            jitter = random.uniform(0, delay * 0.25)
            total_delay = delay + jitter

            logger.info(
                "Transient error encountered on attempt %d/%d (%s). Retrying in %.2fs...",
                attempt + 1,
                attempts,
                exc,
                total_delay,
            )
            await asyncio.sleep(total_delay)
        except Exception:
            # Permanent errors fail immediately without retry
            raise

    if last_error:
        raise last_error
    raise RuntimeError("Unexpected state in retry_with_backoff")


__all__ = ["retry_with_backoff", "DEFAULT_TRANSIENT_EXCEPTIONS"]
