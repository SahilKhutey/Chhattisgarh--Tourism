from __future__ import annotations

import logging
import time
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("cg_tourism")


class RequestContextMiddleware(BaseHTTPMiddleware):
    """
    Attaches X-Request-ID header, tracks duration, and emits structured logs.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get(
            "X-Request-ID",
            str(uuid4()),
        )

        request.state.request_id = request_id
        start = time.perf_counter()

        try:
            response = await call_next(request)
            duration = time.perf_counter() - start

            response.headers["X-Request-ID"] = request_id

            logger.info(
                "request_completed: %s %s -> %s (%.2fms)",
                request.method,
                request.url.path,
                response.status_code,
                duration * 1000,
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": round(duration * 1000, 2),
                },
            )

            return response

        except Exception as exc:
            duration = time.perf_counter() - start
            logger.exception(
                "request_failed: %s %s (%.2fms) error: %s",
                request.method,
                request.url.path,
                duration * 1000,
                exc,
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                },
            )
            raise
