import { getApiBase } from "@/app/data/api-config";

export interface TripResponse {
  id: string;
  userId?: string;
  title: string;
  startDate: string;
  endDate: string;
  originLatitude?: number;
  originLongitude?: number;
  travelers: number;
  status: 'DRAFT' | 'PLANNING' | 'READY' | 'ARCHIVED';
  preferences?: {
    categories?: string[];
    pace: 'RELAXED' | 'BALANCED' | 'FAST';
    accessibility: boolean;
  };
  constraints?: {
    budgetAmount?: number;
    maxDailyTravelMin?: number;
  };
  itineraries?: ApiItinerary[];
}

export interface ApiItinerary {
  id: string;
  tripId: string;
  version: number;
  status: string;
  totalDistanceKm: number;
  totalDurationMin: number;
  estimatedCost: number;
  days: ApiItineraryDay[];
}

export interface ApiItineraryDay {
  id: string;
  sequence: number;
  date: string;
  startTime?: string;
  endTime?: string;
  distanceKm?: number;
  travelMinutes?: number;
  visitMinutes?: number;
  estimatedCost?: number;
  stops: ApiItineraryStop[];
}

export interface ApiItineraryStop {
  id: string;
  dayId: string;
  placeId: string;
  experienceId?: string;
  sequence: number;
  arrivalTime?: string;
  departureTime?: string;
  travelFromPreviousMin?: number;
  visitDurationMin?: number;
  estimatedCost?: number;
  reason?: string;
  isLocked?: boolean;
  place: {
    id: string;
    name: string;
    slug: string;
    latitude: number;
    longitude: number;
    district?: string;
    heroImage?: string;
    category?: {
      name: string;
    };
  };
}

export interface CreateTripPayload {
  title: string;
  startDate: string;
  endDate: string;
  travelers?: number;
  originLatitude?: number;
  originLongitude?: number;
  categories?: string[];
  pace?: 'RELAXED' | 'BALANCED' | 'FAST';
  budgetAmount?: number;
  accessibilityRequired?: boolean;
}

export interface GenerateItineraryPayload {
  pace?: 'RELAXED' | 'BALANCED' | 'FAST';
  categories?: string[];
  maxDailyTravelMin?: number;
  accessibilityRequired?: boolean;
  budgetAmount?: number;
}

export async function createTrip(payload: CreateTripPayload): Promise<TripResponse> {
  const res = await fetch(`${getApiBase()}/itineraries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create trip");
  return res.json();
}

export async function getTrip(tripId: string): Promise<TripResponse> {
  const res = await fetch(`${getApiBase()}/itineraries/${tripId}`);
  if (!res.ok) throw new Error("Failed to load trip");
  return res.json();
}

export async function generateItinerary(
  tripId: string,
  payload: GenerateItineraryPayload = {},
): Promise<ApiItinerary> {
  const res = await fetch(`${getApiBase()}/itineraries/${tripId}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to generate itinerary");
  }
  return res.json();
}

export async function reorderStop(
  tripId: string,
  payload: { stopId: string; targetDaySequence: number; targetStopSequence: number },
): Promise<TripResponse> {
  const res = await fetch(`${getApiBase()}/itineraries/${tripId}/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to reorder stop");
  return res.json();
}

export async function regenerateDay(
  tripId: string,
  payload: { daySequence: number; lockedStopIds?: string[] },
): Promise<ApiItinerary> {
  const res = await fetch(`${getApiBase()}/itineraries/${tripId}/regenerate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to regenerate day");
  return res.json();
}

export async function explainItinerary(tripId: string): Promise<{ narrative: string }> {
  const res = await fetch(`${getApiBase()}/itineraries/${tripId}/explain`);
  if (!res.ok) throw new Error("Failed to load explanation");
  return res.json();
}
