from __future__ import annotations

from enum import Enum


class ContentEntryStatus(str, Enum):
    DRAFT = "DRAFT"
    IN_REVIEW = "IN_REVIEW"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class EntryValidationError(Exception):
    def __init__(self, errors: list[str]) -> None:
        super().__init__(", ".join(errors))
        self.errors = errors


class EntryConflictError(Exception):
    def __init__(self, message: str, current_revision: int | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.current_revision = current_revision


class EntryNotFoundError(Exception):
    def __init__(self, message: str = "Content entry not found.") -> None:
        super().__init__(message)
        self.message = message
