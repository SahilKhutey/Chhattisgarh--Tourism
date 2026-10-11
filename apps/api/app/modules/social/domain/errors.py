from __future__ import annotations

from typing import Any

from app.core.errors import AppError


class SocialEngineError(AppError):
    """Base social engine exception."""

    def __init__(
        self,
        message: str = "Social engine error",
        code: str = "SOCIAL_ENGINE_ERROR",
        status_code: int = 400,
        details: Any = None,
    ) -> None:
        super().__init__(code=code, message=message, status_code=status_code, details=details)


class UnsupportedPlatformError(SocialEngineError, ValueError):
    """The requested social platform is unsupported."""

    def __init__(self, message: str = "Unsupported social platform") -> None:
        super().__init__(message=message, code="UNSUPPORTED_PLATFORM", status_code=400)


class ProviderNotConfiguredError(SocialEngineError):
    """A supported provider is not configured."""

    def __init__(self, message: str = "Provider is not configured") -> None:
        super().__init__(message=message, code="PROVIDER_NOT_CONFIGURED", status_code=503)


class AccountNotAcceptedError(SocialEngineError):
    """The social account has not passed acceptance."""

    def __init__(self, message: str = "Account has not passed acceptance") -> None:
        super().__init__(message=message, code="ACCOUNT_NOT_ACCEPTED", status_code=400)


class AccountSyncDisabledError(SocialEngineError):
    """Synchronization is disabled for the account."""

    def __init__(self, message: str = "Account synchronization is disabled") -> None:
        super().__init__(message=message, code="ACCOUNT_SYNC_DISABLED", status_code=400)


class SourceUrlError(SocialEngineError, ValueError):
    """The external source URL is invalid."""

    def __init__(self, message: str = "External source URL is invalid") -> None:
        super().__init__(message=message, code="INVALID_SOURCE_URL", status_code=400)


class ProviderAuthenticationError(SocialEngineError):
    """Provider authentication failed."""

    def __init__(self, message: str = "Provider authentication failed") -> None:
        super().__init__(message=message, code="PROVIDER_AUTHENTICATION_ERROR", status_code=401)


class ProviderRateLimitError(SocialEngineError):
    """Provider rate limit was reached."""

    def __init__(self, message: str = "Provider rate limit exceeded") -> None:
        super().__init__(message=message, code="PROVIDER_RATE_LIMIT", status_code=429)


class ProviderUnavailableError(SocialEngineError):
    """Provider is temporarily unavailable."""

    def __init__(self, message: str = "Provider is temporarily unavailable") -> None:
        super().__init__(message=message, code="PROVIDER_UNAVAILABLE", status_code=503)


class ContentNormalizationError(SocialEngineError):
    """Provider content could not be normalized."""

    def __init__(self, message: str = "Content could not be normalized") -> None:
        super().__init__(message=message, code="CONTENT_NORMALIZATION_ERROR", status_code=422)


class SocialAccountAlreadyExistsError(SocialEngineError):
    """Social account already exists for the platform and handle."""

    def __init__(self, platform: object, handle: str) -> None:
        plat_str = platform.value if hasattr(platform, "value") else str(platform)
        super().__init__(
            message=f"Social account already exists for {plat_str}: '{handle}'.",
            code="SOCIAL_ACCOUNT_ALREADY_EXISTS",
            status_code=409,
        )
        self.platform = plat_str
        self.handle = handle


class ProviderAuthorizationError(SocialEngineError):
    """Provider authorization or access is unavailable."""

    def __init__(self, message: str = "Provider authorization is unavailable") -> None:
        super().__init__(message=message, code="PROVIDER_AUTH_UNAVAILABLE", status_code=403)


class SocialSyncLockConflictError(SocialEngineError):
    """Raised when sync lock cannot be acquired or sync is already in progress."""

    def __init__(self, message: str = "Social sync lock conflict") -> None:
        super().__init__(message=message, code="SYNC_LOCK_CONFLICT", status_code=409)


class SyncAlreadyRunningError(SocialSyncLockConflictError):
    """Raised when sync is already actively executing for the account."""

    def __init__(self, message: str = "Sync is already running") -> None:
        super().__init__(message=message)
        self.code = "SYNC_ALREADY_RUNNING"
        self.status_code = 409


class CircuitBreakerOpenError(SocialEngineError):
    """Raised when provider circuit breaker is open due to recent failures."""

    def __init__(self, message: str = "Circuit breaker is open") -> None:
        super().__init__(message=message, code="CIRCUIT_BREAKER_OPEN", status_code=503)


__all__ = [
    "SocialEngineError",
    "UnsupportedPlatformError",
    "ProviderNotConfiguredError",
    "AccountNotAcceptedError",
    "AccountSyncDisabledError",
    "SourceUrlError",
    "ProviderAuthenticationError",
    "ProviderRateLimitError",
    "ProviderUnavailableError",
    "ContentNormalizationError",
    "SocialAccountAlreadyExistsError",
    "ProviderAuthorizationError",
    "SocialSyncLockConflictError",
    "SyncAlreadyRunningError",
    "CircuitBreakerOpenError",
]
