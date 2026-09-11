class PublicContentError(Exception):
    """Base exception for public content errors."""


class ContentNotFoundError(PublicContentError):
    """Raised when published content does not exist or is unpublished."""

    def __init__(self, identifier: str):
        super().__init__(f"Public content '{identifier}' not found.")
        self.identifier = identifier


class UnsupportedLocaleError(PublicContentError):
    """Raised when an unsupported locale is requested."""

    def __init__(self, locale: str):
        super().__init__(f"Unsupported locale '{locale}'.")
        self.locale = locale


class DraftAccessDeniedError(PublicContentError):
    """Raised when an unauthenticated request attempts to view preview/draft content."""

    def __init__(self, entry_id: str):
        super().__init__(f"Access denied to preview content '{entry_id}'.")
        self.entry_id = entry_id
