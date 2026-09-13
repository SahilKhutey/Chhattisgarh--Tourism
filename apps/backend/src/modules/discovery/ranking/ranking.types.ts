export interface DiscoveryCandidate {
  id: string;
  name: string;
  slug: string;
  distanceMeters?: number;
  nameScore?: number;
  categoryScore?: number;
  geographicScore?: number;
  shortDescription?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  district?: string | null;
  zone?: string | null;
  category?: string | null;
  [key: string]: any;
}

export interface RankedCandidate extends DiscoveryCandidate {
  score: number;
}
