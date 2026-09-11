class SearchError(Exception):
    """Base exception for search operations."""
    pass


class SearchValidationError(SearchError):
    """Raised when search parameters violate validation rules."""
    pass


class IndexRebuildError(SearchError):
    """Raised when index rebuilding encounters an unrecoverable failure."""
    pass
