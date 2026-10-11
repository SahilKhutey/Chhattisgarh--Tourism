from __future__ import annotations

import uuid
from typing import Any, Protocol, runtime_checkable

from app.modules.social.providers.instagram.errors import (
    InstagramAuthenticationError,
)


def mask_token(token: str | None) -> str:
    """Masks secret tokens for safe representation."""
    if not token:
        return "[EMPTY]"
    if len(token) <= 8:
        return "[MASKED]"
    return f"{token[:4]}...{token[-4:]}"


@runtime_checkable
class InstagramCredentialService(Protocol):
    """Protocol for secure Instagram/Meta access token management."""

    async def get_access_token(self, account_id: uuid.UUID) -> str:
        """Retrieves active valid access token for the given account."""
        ...

    async def refresh_if_required(self, account_id: uuid.UUID) -> str:
        """Refreshes expired or near-expiry token and returns refreshed token."""
        ...

    async def revoke(self, account_id: uuid.UUID) -> None:
        """Revokes token access for the given account."""
        ...


class InMemoryInstagramCredentialService:
    """In-memory credential store for tests and development execution."""

    def __init__(self, initial_tokens: dict[uuid.UUID, str] | None = None) -> None:
        self._tokens: dict[uuid.UUID, str] = dict(initial_tokens or {})

    def set_token(self, account_id: uuid.UUID, token: str) -> None:
        self._tokens[account_id] = token

    async def get_access_token(self, account_id: uuid.UUID) -> str:
        token = self._tokens.get(account_id)
        if not token:
            raise InstagramAuthenticationError(
                f"No Instagram access token available for account '{account_id}'."
            )
        return token

    async def refresh_if_required(self, account_id: uuid.UUID) -> str:
        return await self.get_access_token(account_id)

    async def revoke(self, account_id: uuid.UUID) -> None:
        self._tokens.pop(account_id, None)


__all__ = [
    "InstagramCredentialService",
    "InMemoryInstagramCredentialService",
    "mask_token",
]
