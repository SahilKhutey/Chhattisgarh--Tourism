export type OfflineEntityType =
  | "place"
  | "destination"
  | "itinerary";

export type SyncActionType =
  | "BOOKMARK_CREATE"
  | "BOOKMARK_DELETE"
  | "SOS_CREATE"
  | "ITINERARY_UPDATE";

export type SyncStatus =
  | "pending"
  | "processing"
  | "failed"
  | "conflicted";


export interface OfflinePlace {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  districtId?: string;
  categoryIds?: string[];
  verified?: boolean;
  rating?: number;
  durationMinutes?: number;
  updatedAt?: string;
  cachedAt?: string;
  [key: string]: unknown;
}

export interface OfflineDestination {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  heroImageUrl?: string;
  placeIds?: string[];
  latitude?: number;
  longitude?: number;
  rating?: number;
  category?: string;
  district?: string;
  updatedAt?: string;
  cachedAt?: string;
  [key: string]: unknown;
}

export interface OfflineItinerary {
  id: string;
  title: string;
  district?: string;
  startDate?: string;
  endDate?: string;
  placeIds?: string[];
  tripDays?: number;
  earnedScore?: number;
  data: unknown;
  updatedAt: string;
  cachedAt: string;
}

export interface SyncQueueItem {
  id: string;
  operationId?: string;
  action: SyncActionType;
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
  status: SyncStatus;
  lastError?: string;
}

export interface OfflineSafetyResource {
  id: string;
  title: string;
  category: string;
  phoneNumber: string;
  district?: string;
  updatedAt: string;
}

export interface OfflineMeta {
  key: string;
  value: unknown;
  updatedAt: string;
}

