export interface DiscoveryResult {
  id: string;
  templateId: string;
  templateName: string;
  templateSlug: string;
  slug: string;
  title: string;
  data: Record<string, unknown>;
  region?: string | null;
  division?: string | null;
  district?: string | null;
  lat?: number | null;
  lng?: number | null;
  tags?: string[] | null;
  score?: number;
  publishedAt?: string | null;
}

export interface DiscoveryResponse {
  items: DiscoveryResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    query?: string;
    templateId?: string;
    region?: string;
    division?: string;
    district?: string;
  };
}

export interface SearchParams {
  q?: string;
  templateId?: string;
  region?: string;
  division?: string;
  district?: string;
  page?: number;
  limit?: number;
}

export interface NearbyParams {
  lat: number;
  lng: number;
  radiusKm?: number;
  limit?: number;
}
