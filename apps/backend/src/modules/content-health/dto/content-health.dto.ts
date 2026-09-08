export type ContentHealthStatus = 'HEALTHY' | 'WARNING' | 'STALE' | 'INCOMPLETE' | 'INVALID' | 'UNVERIFIED';

export interface ContentHealthCalculationInput {
  hasImage: boolean;
  hasDescription: boolean;
  hasCoordinates: boolean;
  hasDistrict: boolean;
  verified: boolean;
  daysSinceUpdate: number;
}

export interface PlaceHealthReport {
  placeId: string;
  name: string;
  slug: string;
  score: number;
  status: ContentHealthStatus;
  warnings: string[];
  lastUpdated: Date;
}

export interface ContentHealthSummary {
  total: number;
  healthy: number;
  warning: number;
  stale: number;
  incomplete: number;
  healthyPercentage: number;
  warningPercentage: number;
  stalePercentage: number;
  incompletePercentage: number;
}
