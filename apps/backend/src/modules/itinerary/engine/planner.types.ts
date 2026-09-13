export type PlanningPace = 'RELAXED' | 'BALANCED' | 'FAST';

export interface PlanningRequest {
  tripId: string;
  startDate: Date;
  endDate: Date;
  travelers: number;
  origin?: {
    latitude: number;
    longitude: number;
  };
  categories?: string[];
  pace: PlanningPace;
  budgetAmount?: number;
  maxDailyDistanceKm?: number;
  maxDailyTravelMin?: number;
  accessibilityRequired?: boolean;
  requiredPlaceIds?: string[];
  excludedPlaceIds?: string[];
}

export interface PlanningCandidate {
  placeId: string;
  experienceId?: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  visitDurationMin: number;
  estimatedCost: number;
  categoryIds: string[];
  categoryName?: string;
  difficulty?: string;
  accessibility?: boolean;
  seasonalAvailable: boolean;
  rating: number;
  reviewCount: number;
  isPublished: boolean;
  isPublic: boolean;
  rules?: string | null;
  safetyInfo?: string | null;
}

export interface PlanningScoreBreakdown {
  preferenceMatch: number;
  geographicEfficiency: number;
  experienceQuality: number;
  timeCompatibility: number;
  budgetCompatibility: number;
}

export interface ScoredCandidate {
  candidate: PlanningCandidate;
  score: number;
  scoreBreakdown: PlanningScoreBreakdown;
  reason: string;
}

export interface GeneratedStop {
  placeId: string;
  experienceId?: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  sequence: number;
  arrivalTime: string;
  departureTime: string;
  travelFromPreviousMin: number;
  visitDurationMin: number;
  estimatedCost: number;
  reason: string;
  isLocked: boolean;
}

export interface GeneratedDay {
  date: string;
  sequence: number;
  startTime: string;
  endTime: string;
  distanceKm: number;
  travelMinutes: number;
  visitMinutes: number;
  estimatedCost: number;
  stops: GeneratedStop[];
}

export interface GeneratedItinerary {
  status: 'READY' | 'DRAFT';
  totalDistanceKm: number;
  totalDurationMin: number;
  estimatedCost: number;
  days: GeneratedDay[];
}
