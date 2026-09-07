import { getApiBase, getApiOrigin, resolveAssetUrl } from "./api-config";
import { fallbackPlaceSeeds } from "./fallback-places";

const API_BASE = getApiBase();
const REQUEST_RETRIES = 3;

export type VerificationBadge = "BLUE" | "GREEN" | "CULTURAL" | "NONE";

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bannerUrl: string;
  district: string;
  languages: string[];
  categories: string[];
  bio: string;
  verificationBadges: VerificationBadge[];
  followers: string;
  contentCount: number;
  engagementScore: number;
  tourismScore: number;
  ecoSafeScore: number;
  socialLinks: {
    instagram?: string;
    youtube?: string;
  };
}

export interface CreatorVideo {
  id: string;
  creatorId: string;
  thumbnailUrl: string;
  videoUrl?: string;
  title: string;
  location: string;
  district: string;
  category: string;
  views: string;
  duration: string;
  language: string;
  isTrending?: boolean;
  isHiddenGem?: boolean;
}

export interface Destination {
  id: string;
  name: string;
  category: "waterfalls" | "forests" | "temples" | "villages" | string;
  district?: string;
  tagline: string;
  coordinates: { lat: number; lng: number; mapX: number; mapY: number };
  heroImage: string;
  storyTitle: string;
  story: string;
  timings: string;
  routes: string;
  bestTime: string;
  seasonalAdvice: string;
  safety: string;
  nearby: string[];
  localInsights: string;
  ecoGuidance: string;
  biodiversityScore: number;
  crowdCapacity: number;
  rating: number;
  localFood: string;
  photographySpots: string;
  audioUrl?: string;
  audioNarrator?: string;
  media: { id: string; url: string; type: string; license?: string; creatorHandle?: string; tags?: string[] }[];
  highlights?: string[];
  experienceTypes?: string[];
  platformFeatures?: string[];
  priorityPhase?: string;
  verificationLevel?: string;
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
    dynamicRoutes?: any[];
  };
}

export interface AtisStats {
  totalNodes: number;
  verifiedNodes: number;
  activeFlags: number;
  pendingDiscoveries: number;
  systemHealth: "OPTIMAL" | "WARNING" | "CRITICAL";
}

export interface SystemFlag {
  id: string;
  flagType: string;
  description: string;
  status: string;
  aiConfidence: number;
  createdAt: string;
  place?: { id: string; name: string };
  media?: { id: string; url: string };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonWithRetry<T>(url: string, init?: RequestInit): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= REQUEST_RETRIES; attempt += 1) {
    try {
      const res = await fetch(url, init);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status} for ${url}`);
      }

      return await res.json() as T;
    } catch (error) {
      lastError = error;
      if (attempt < REQUEST_RETRIES) {
        await sleep(attempt * 400);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Failed to fetch ${url}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBackendPlace(p: any): Destination {
  const mapX = ((p.longitude - 80.2) / (84.4 - 80.2)) * 100;
  const mapY = 100 - (((p.latitude - 17.8) / (24.1 - 17.8)) * 100);

  return {
    id: p.slug,
    name: p.name,
    category: p.category?.slug || "waterfalls",
    district: p.district,
    tagline: p.description,
    coordinates: { lat: p.latitude, lng: p.longitude, mapX, mapY },
    heroImage: (() => {
      const isPlaceholder = p.heroImage && (p.heroImage.includes("placehold.co") || p.heroImage.includes("unsplash") || p.heroImage.includes("picsum"));
      if (p.heroImage && !isPlaceholder) return resolveAssetUrl(p.heroImage);

      const fallbacks = [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chitrakot_waterfalls.JPG/1280px-Chitrakot_waterfalls.JPG",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bhoramdeo_Temple%2C_Kawardha.jpg/1280px-Bhoramdeo_Temple%2C_Kawardha.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/MAINPAT%2CAMBIKAPUR_CG.jpg/1280px-MAINPAT%2CAMBIKAPUR_CG.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Danteswari_Temple_0034.jpg/1280px-Danteswari_Temple_0034.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/1/19/Kanger_valley_National_Park.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mahanadi_from_Banki.jpg/1280px-Mahanadi_from_Banki.jpg"
      ];
      return fallbacks[p.slug.length % fallbacks.length];
    })(),
    storyTitle: `The Story of ${p.name}`,
    story: p.history || "",
    timings: "6:00 AM - 6:00 PM",
    routes: "Well connected by road.",
    bestTime: p.bestSeason || "Year round",
    seasonalAdvice: "Check local weather before visiting.",
    safety: p.safetyInfo || "Standard safety precautions apply.",
    nearby: [],
    localInsights: "A truly magnificent location.",
    ecoGuidance: p.rules || "Leave no trace.",
    biodiversityScore: 88,
    crowdCapacity: 500,
    rating: 4.8,
    localFood: "Local tribal thali available nearby.",
    photographySpots: "Best during sunrise.",
    audioUrl: p.audioUrl,
    audioNarrator: p.audioNarrator,
    media: ((p.media && p.media.length <= 1)
      ? (p.media || []).concat([
          { id: "extra1", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chitrakot_waterfalls.JPG/1280px-Chitrakot_waterfalls.JPG", type: "IMAGE" },
          { id: "extra2", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bhoramdeo_Temple%2C_Kawardha.jpg/1280px-Bhoramdeo_Temple%2C_Kawardha.jpg", type: "IMAGE" },
          { id: "extra3", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/MAINPAT%2CAMBIKAPUR_CG.jpg/1280px-MAINPAT%2CAMBIKAPUR_CG.jpg", type: "IMAGE" },
        ])
      : (p.media || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ).map((m: any, idx: number) => {
      const fallbacks = [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chitrakot_waterfalls.JPG/1280px-Chitrakot_waterfalls.JPG",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bhoramdeo_Temple%2C_Kawardha.jpg/1280px-Bhoramdeo_Temple%2C_Kawardha.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/MAINPAT%2CAMBIKAPUR_CG.jpg/1280px-MAINPAT%2CAMBIKAPUR_CG.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Danteswari_Temple_0034.jpg/1280px-Danteswari_Temple_0034.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/1/19/Kanger_valley_National_Park.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mahanadi_from_Banki.jpg/1280px-Mahanadi_from_Banki.jpg"
      ];

      return {
        id: m.id || `media-${idx}`,
        url: (m.url?.includes("unsplash") || m.url?.includes("picsum") || m.url?.includes("placehold.co"))
          ? fallbacks[idx % fallbacks.length]
          : resolveAssetUrl(m.url),
        type: m.type || "IMAGE",
        license: m.license,
        creatorHandle: m.creatorHandle,
        tags: typeof m.tags === 'string' ? JSON.parse(m.tags || '[]') : m.tags,
      };
    }),
    highlights: p.highlights || [],
    experienceTypes: p.experienceTypes || [],
    platformFeatures: p.platformFeatures || [],
    priorityPhase: p.priorityPhase,
    verificationLevel: p.verificationLevel || "UNVERIFIED",
    weather: p.weather ? {
      currentTemp: p.weather.currentTemp,
      condition: p.weather.condition,
      alerts: typeof p.weather.alerts === 'string' ? JSON.parse(p.weather.alerts || '[]') : p.weather.alerts,
      monsoonWarning: p.weather.monsoonWarning,
    } : undefined,
    transport: p.transport ? {
      nearestAirport: p.transport.nearestAirport,
      airportDistance: p.transport.airportDistance,
      nearestStation: p.transport.nearestStation,
      dynamicRoutes: typeof p.transport.dynamicRoutes === 'string' ? JSON.parse(p.transport.dynamicRoutes || '[]') : p.transport.dynamicRoutes,
    } : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBackendCreator(c: any): Creator {
  return {
    id: c.id,
    name: c.user?.fullName || "Creator",
    handle: `@${c.user?.fullName?.replace(/\s+/g, "_").toLowerCase() || "creator"}`,
    avatarUrl: resolveAssetUrl(c.user?.avatar) || "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Danteswari_Temple_0034.jpg/1280px-Danteswari_Temple_0034.jpg",
    bannerUrl: "https://upload.wikimedia.org/wikipedia/commons/1/19/Kanger_valley_National_Park.png",
    district: c.district,
    languages: JSON.parse(c.languages || "[]"),
    categories: JSON.parse(c.categories || "[]"),
    bio: c.bio || "",
    verificationBadges: JSON.parse(c.verificationBadges || "[]"),
    followers: c.followers,
    contentCount: c.contentCount,
    engagementScore: c.engagementScore,
    tourismScore: c.tourismScore,
    ecoSafeScore: c.ecoSafeScore,
    socialLinks: {
      instagram: c.instagram,
      youtube: c.youtube,
    },
  };
}

function getFallbackDestinations(): Destination[] {
  return fallbackPlaceSeeds.map((place) =>
    mapBackendPlace({
      ...place,
      category: { slug: place.category },
      media: place.media ?? [{ id: `${place.slug}-media-1`, url: place.heroImage, type: "IMAGE" }],
    }),
  );
}

export async function fetchPlaces(categorySlug?: string, district?: string): Promise<Destination[]> {
  const searchParams = new URLSearchParams();
  if (categorySlug) searchParams.set("category", categorySlug);
  if (district) searchParams.set("district", district);

  const query = searchParams.toString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await fetchJsonWithRetry<any[]>(
    `${API_BASE}/places${query ? `?${query}` : ""}`,
    { next: { revalidate: 10 } },
  );
  return data.map(mapBackendPlace);
}

export async function fetchPlaceBySlug(slug: string): Promise<Destination | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await fetchJsonWithRetry<any>(`${API_BASE}/places/${slug}`, { next: { revalidate: 10 } });
  return mapBackendPlace(data);
}

export async function fetchCreators(): Promise<{ creators: Creator[]; videos: CreatorVideo[] }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await fetchJsonWithRetry<any[]>(`${API_BASE}/users/creators`, { next: { revalidate: 10 } });
    const creators = data.map(mapBackendCreator);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const videos = data.flatMap((creator: any) => creator.videos || []);
    return { creators, videos };
  } catch (error) {
    console.error(error);
    return { creators: [], videos: [] };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchCreatorFeed(page: number = 1, limit: number = 15): Promise<{ videos: CreatorVideo[]; metadata: any }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await fetchJsonWithRetry<any>(`${API_BASE}/users/creators/feed?page=${page}&limit=${limit}`, { next: { revalidate: 10 } });
  } catch (error) {
    console.error(error);
    return { videos: [], metadata: { totalPages: 0 } };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createCreatorPost(token: string, data: any) {
  const res = await fetch(`${API_BASE}/users/creators/videos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
}

export async function fetchCreatorById(id: string): Promise<{ creator: Creator | null; videos: CreatorVideo[] }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await fetchJsonWithRetry<any>(`${API_BASE}/users/creators/${id}`, { next: { revalidate: 10 } });
    return {
      creator: mapBackendCreator(data),
      videos: data.videos || [],
    };
  } catch (error) {
    console.error(error);
    return { creator: null, videos: [] };
  }
}

export async function deletePlace(id: string, token: string) {
  const res = await fetch(`${API_BASE}/moderation/places/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete place");
  return res.json();
}

export async function deleteCreator(id: string, token: string) {
  const res = await fetch(`${API_BASE}/moderation/creators/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete creator");
  return res.json();
}

export async function authenticateTestUser(): Promise<string> {
  if (typeof window !== "undefined") {
    const existingToken = localStorage.getItem("access_token");
    if (existingToken) return existingToken;
  }

  const email = "testuser@example.com";
  const password = "TestUser123!";

  let res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: "Test User", email, password }),
    });
    if (!regRes.ok) {
      console.error("Failed to create test user", await regRes.text());
      return "";
    }
    res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  }

  const data = await res.json();
  if (typeof window !== "undefined" && data.accessToken) {
    localStorage.setItem("access_token", data.accessToken);
  }
  return data.accessToken;
}

export async function fetchComments(videoId: string) {
  const res = await fetch(`${API_BASE}/community/videos/${videoId}/comments`);
  if (!res.ok) return [];
  return res.json();
}

export async function postComment(videoId: string, text: string, token: string) {
  const res = await fetch(`${API_BASE}/community/videos/${videoId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to post comment");
  return res.json();
}

export async function deleteComment(commentId: string, token: string) {
  const res = await fetch(`${API_BASE}/community/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete comment");
  return res.json();
}

export async function fetchPolls(videoId: string) {
  const res = await fetch(`${API_BASE}/community/videos/${videoId}/polls`);
  if (!res.ok) return [];
  return res.json();
}

export async function voteOnPoll(pollId: string, optionId: string, token: string) {
  const res = await fetch(`${API_BASE}/community/polls/${pollId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ optionId }),
  });
  if (!res.ok) throw new Error("Failed to vote");
  return res.json();
}

export async function saveTrip(videoId: string, token: string) {
  const res = await fetch(`${API_BASE}/community/videos/${videoId}/save-trip`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to save trip");
  return res.json();
}

export async function unsaveTrip(videoId: string, token: string) {
  const res = await fetch(`${API_BASE}/community/videos/${videoId}/save-trip`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to unsave trip");
  return res.json();
}

export async function fetchSavedTrips(token: string) {
  const res = await fetch(`${API_BASE}/community/saved-trips`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function triggerAggregationSync() {
  const res = await fetch(`${getApiOrigin()}/api/aggregation/sync-all`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to trigger sync");
  return res.json();
}

export interface Booking {
  id: string;
  userId: string;
  placeId: string;
  visitDate: string;
  guests: number;
  totalPrice: number;
  status: string;
  notes?: string;
  contactPhone?: string;
  place?: {
    name: string;
    heroImage: string;
    district: string;
    category?: { name: string };
  };
}

export async function createBooking(data: { placeId: string; visitDate: string; guests: number; contactPhone?: string; notes?: string }, token: string) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create booking");
  return res.json();
}

export async function getMyBookings(token: string): Promise<Booking[]> {
  const res = await fetch(`${API_BASE}/bookings/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export async function cancelBooking(bookingId: string, token: string) {
  const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to cancel booking");
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// ATIS (Autonomous Tourism Intelligence System) Admin
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAtisStats(): Promise<AtisStats> {
  const res = await fetchJsonWithRetry<AtisStats>(`${API_BASE}/atis/stats`, { next: { revalidate: 5 } });
  return res;
}

export async function fetchAtisFlags(): Promise<SystemFlag[]> {
  const res = await fetchJsonWithRetry<SystemFlag[]>(`${API_BASE}/atis/flags`, { next: { revalidate: 5 } });
  return res;
}

export async function fetchPendingDiscoveries(): Promise<Destination[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await fetchJsonWithRetry<any[]>(`${API_BASE}/atis/pending-places`, { next: { revalidate: 5 } });
  return data.map(mapBackendPlace);
}

export async function approvePlace(placeId: string, level: string, token?: string) {
  const res = await fetch(`${API_BASE}/atis/approve-place/${placeId}`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ level })
  });
  if (!res.ok) throw new Error("Failed to approve place");
  return res.json();
}

