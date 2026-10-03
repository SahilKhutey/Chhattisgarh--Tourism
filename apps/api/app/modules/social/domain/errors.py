from __future__ import annotations


class SocialEngineError(Exception):
    """Base social engine exception."""


class UnsupportedPlatformError(SocialEngineError):
    """The requested social platform is unsupported."""


class ProviderNotConfiguredError(SocialEngineError):
    """A supported provider is not configured."""


class AccountNotAcceptedError(SocialEngineError):
    """The social account has not passed acceptance."""


class AccountSyncDisabledError(SocialEngineError):
    """Synchronization is disabled for the account."""


class SourceUrlError(SocialEngineError):
    """The external source URL is invalid."""


class ProviderAuthenticationError(SocialEngineError):
    """Provider authentication failed."""


class ProviderRateLimitError(SocialEngineError):
    """Provider rate limit was reached."""


class ProviderUnavailableError(SocialEngineError):
    """Provider is temporarily unavailable."""


class ContentNormalizationError(SocialEngineError):
    """Provider content could not be normalized."""
