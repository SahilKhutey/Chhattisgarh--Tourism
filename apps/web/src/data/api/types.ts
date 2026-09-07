export interface PlaceDistrict {
  id?: string;
  name: string;
  slug?: string;
}

export interface PlaceCategory {
  id: string;
  name: string;
  slug: string;
}

export interface PlaceMedia {
  id: string;
  url: string;
  type: string;
  license?: string;
  creatorHandle?: string;
  tags?: string[];
}

export interface Place {
  id: string;
  slug: string;
  name: string;
  description: string | null;

  latitude: number;
  longitude: number;

  district: PlaceDistrict;
  category?: PlaceCategory | null;

  imageUrl: string | null;
  heroImage?: string | null;

  verified: boolean;
  verificationLevel?: string;

  rating?: number | null;
  reviewCount?: number;
  durationMinutes?: number | null;

  bestSeason?: string | null;
  history?: string | null;
  safetyInfo?: string | null;
  rules?: string | null;
  audioUrl?: string | null;
  audioNarrator?: string | null;

  highlights?: string[];
  experienceTypes?: string[];
  platformFeatures?: string[];
  media?: PlaceMedia[];

  weather?: {
    currentTemp?: number;
    condition?: string;
    alerts?: string[];
    monsoonWarning?: boolean;
  };

  transport?: {
    nearestAirport?: string;
    airportDistance?: number;
    nearestStation?: string;
    dynamicRoutes?: unknown[];
  };

  createdAt?: string;
  updatedAt?: string;
}

export interface District {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  placeCount?: number;
  latitude?: number | null;
  longitude?: number | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  placeCount?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PlaceSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  district?: string;
  category?: string;
  verified?: boolean;
}
