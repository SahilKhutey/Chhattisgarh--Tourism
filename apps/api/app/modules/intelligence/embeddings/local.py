from __future__ import annotations

import hashlib
import math
import os
from typing import Any

from .base import EmbeddingProvider


class LocalSentenceTransformerProvider(EmbeddingProvider):
    """
    Local embedding provider utilizing sentence-transformers.
    Lazy-loads the PyTorch model on first inference request.
    """

    def __init__(self, model_name: str | None = None, dimension: int = 1024) -> None:
        self.model_name = model_name or os.environ.get("CG_EMBEDDING_MODEL", "BAAI/bge-m3")
        self._target_dim = dimension
        self._model: Any = None

    def _get_model(self) -> Any:
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
            except Exception as e:
                # Fallback to deterministic provider if model weights cannot be downloaded or offline
                self._model = DeterministicMockEmbeddingProvider(dimension=self._target_dim)
        return self._model

    @property
    def dimension(self) -> int:
        model = self._get_model()
        if hasattr(model, "get_sentence_embedding_dimension"):
            return model.get_sentence_embedding_dimension()
        return getattr(model, "dimension", self._target_dim)

    def embed(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        model = self._get_model()
        if hasattr(model, "encode"):
            vectors = model.encode(
                texts,
                normalize_embeddings=True,
                show_progress_bar=False,
            )
            return [vector.tolist() for vector in vectors]
        return model.embed(texts)


class DeterministicMockEmbeddingProvider(EmbeddingProvider):
    """
    Fast, deterministic embedding provider for offline testing and CI.
    Generates reproducible unit-length vectors with dimension D.
    Similar texts produce higher cosine similarity.
    """

    def __init__(self, dimension: int = 1024) -> None:
        self._dimension = dimension

    @property
    def dimension(self) -> int:
        return self._dimension

    def embed(self, texts: list[str]) -> list[list[float]]:
        results: list[list[float]] = []
        for text in texts:
            vec = [0.0] * self._dimension
            tokens = text.lower().split()
            if not tokens:
                vec[0] = 1.0
                results.append(vec)
                continue

            for i, token in enumerate(tokens):
                # Hash token into dimension indices
                token_hash = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
                idx = token_hash % self._dimension
                weight = 1.0 / math.sqrt(i + 1)
                vec[idx] += weight

            # Normalize to unit length (L2 norm)
            norm = math.sqrt(sum(x * x for x in vec))
            if norm > 0.0:
                vec = [x / norm for x in vec]
            else:
                vec[0] = 1.0
            results.append(vec)
        return results


def get_embedding_provider() -> EmbeddingProvider:
    """Factory returning configured embedding provider based on environment."""
    provider_type = os.environ.get("CG_EMBEDDING_PROVIDER", "local").lower()
    dimension = int(os.environ.get("CG_EMBEDDING_DIMENSION", "1024"))
    model_name = os.environ.get("CG_EMBEDDING_MODEL", "BAAI/bge-m3")

    # In testing environment default to deterministic mock for speed and zero network dependency
    if provider_type == "mock" or os.environ.get("APP_ENV") == "testing":
        return DeterministicMockEmbeddingProvider(dimension=dimension)

    return LocalSentenceTransformerProvider(model_name=model_name, dimension=dimension)
