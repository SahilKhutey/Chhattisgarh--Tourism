export type SearchIntent =
  | "nature"
  | "spiritual"
  | "wildlife"
  | "heritage"
  | "culture"
  | "adventure"
  | "waterfall"
  | "crafts"
  | "general";

export interface HybridSearchItem {
  id: string;
  slug: string;
  title: string;
  content_type: string;
  district: string | null;
  categories: string[];
  tags: string[];
  description: string | null;
  thumbnail_url: string | null;
  latitude: number | null;
  longitude: number | null;
  score: number;
  lexical_score: number | null;
  semantic_score: number | null;
  hybrid_score: number;
  match_reason: string;
}

export interface HybridSearchResponse {
  query: string;
  mode: "hybrid" | "lexical";
  total: number;
  page: number;
  page_size: number;
  items: HybridSearchItem[];
  facets: Record<string, Record<string, number>>;
  semantic_enabled: boolean;
  fallback_used: boolean;
  intent: SearchIntent | null;
}

export interface Recommendation {
  id: string;
  slug: string;
  title: string;
  content_type: string;
  district: string | null;
  category: string | null;
  reason: string;
  score: number;
  thumbnail_url: string | null;
}

export interface RecommendationResponse {
  source_content_id: string;
  recommendations: Recommendation[];
}

export interface GraphEntityContext {
  id: string;
  entity_type: string;
  name: string;
  slug: string;
}

export interface PublicContextResponse {
  entity: GraphEntityContext;
  located_in: GraphEntityContext | null;
  categories: GraphEntityContext[];
  activities: GraphEntityContext[];
  nearby: GraphEntityContext[];
}

export interface DiscoveryResponse {
  query: string | null;
  intent: SearchIntent | null;
  results: HybridSearchItem[];
  suggested_queries: string[];
  related_categories: string[];
  recommendations: Recommendation[];
}

export interface IntelligenceHealthResponse {
  status: string;
  intelligence: {
    embedding_model: {
      id: string;
      model_name: string;
      dimension: number;
      provider: string;
      is_active: boolean;
    } | null;
    embedding_coverage: {
      published_entries: number;
      embedded_entries: number;
      coverage_percent: number;
    };
    graph_entities: {
      total_entities: number;
      total_relationships: number;
      by_type: Record<string, number>;
    };
    subsystems: {
      embeddings: string;
      knowledge_graph: string;
      hybrid_search: string;
      recommendations: string;
    };
  };
}
