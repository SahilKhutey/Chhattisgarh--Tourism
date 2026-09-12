from __future__ import annotations

from abc import ABC, abstractmethod


class EmbeddingProvider(ABC):
    """Abstract interface for text embedding providers."""

    @property
    @abstractmethod
    def dimension(self) -> int:
        """Returns the vector dimension produced by this provider."""
        raise NotImplementedError

    @abstractmethod
    def embed(
        self,
        texts: list[str],
    ) -> list[list[float]]:
        """Embeds a list of input texts into normalized float vectors."""
        raise NotImplementedError
