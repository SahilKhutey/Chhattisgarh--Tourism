from __future__ import annotations

from typing import Any
from fastapi import Request, status
from fastapi.responses import JSONResponse


class AppError(Exception):
    """
    Standard application domain error for CG Tourism platform.
    """

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Any = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details


async def app_error_handler(
    request: Request,
    exc: AppError,
) -> JSONResponse:
    """
    Standardized FastAPI exception handler producing predictable error JSON.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            }
        },
    )
