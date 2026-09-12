"""Domain exceptions for Intelligence, Semantic Discovery, and Knowledge Graph."""


class IntelligenceError(Exception):
    """Base exception for intelligence module."""
    pass


class EmbeddingError(IntelligenceError):
    """Raised when embedding generation or model lookup fails."""
    pass


class VectorIndexError(IntelligenceError):
    """Raised when vector similarity query fails."""
    pass


class KnowledgeGraphError(IntelligenceError):
    """Raised when graph entity or relationship operation fails."""
    pass


class EntityResolutionError(KnowledgeGraphError):
    """Raised when entity alias cannot be resolved."""
    pass


class RecommendationError(IntelligenceError):
    """Raised when recommendation candidate generation fails."""
    pass


class QueryParsingError(IntelligenceError):
    """Raised when query intent parsing fails."""
    pass
