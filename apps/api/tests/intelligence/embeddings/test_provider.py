from __future__ import annotations

import math
from app.modules.intelligence.embeddings.local import (
    DeterministicMockEmbeddingProvider,
    LocalSentenceTransformerProvider,
)


def test_mock_embedding_dimension():
    provider = DeterministicMockEmbeddingProvider(dimension=1024)
    vectors = provider.embed(["Chhattisgarh tourism"])
    assert len(vectors) == 1
    assert len(vectors[0]) == 1024


def test_mock_embedding_is_stable_and_deterministic():
    provider = DeterministicMockEmbeddingProvider(dimension=1024)
    first = provider.embed(["Chitrakote Waterfall"])[0]
    second = provider.embed(["Chitrakote Waterfall"])[0]
    assert first == second


def test_mock_embedding_is_unit_normalized():
    provider = DeterministicMockEmbeddingProvider(dimension=512)
    vectors = provider.embed(["Bastar waterfalls", "Sirpur ancient temples"])
    assert len(vectors) == 2
    for vec in vectors:
        norm = math.sqrt(sum(x * x for x in vec))
        assert math.isclose(norm, 1.0, rel_tol=1e-5)


def test_empty_text_embedding():
    provider = DeterministicMockEmbeddingProvider(dimension=128)
    vectors = provider.embed([""])
    assert len(vectors) == 1
    assert len(vectors[0]) == 128
    assert vectors[0][0] == 1.0


def test_local_provider_lazy_load_fallback():
    provider = LocalSentenceTransformerProvider(model_name="nonexistent-test-model", dimension=256)
    assert provider.dimension == 256
    vectors = provider.embed(["Test text"])
    assert len(vectors) == 1
    assert len(vectors[0]) == 256
