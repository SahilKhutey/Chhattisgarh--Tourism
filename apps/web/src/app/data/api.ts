// Client for fetching real data from the backend
const API_BASE = 'http://localhost:4000/api/v1';

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
  category: 'waterfalls' | 'forests' | 'temples' | 'villages' | string;
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
}

function mapBackendPlace(p: any): Destination {
  // Approximate mapX and mapY for Chhattisgarh bounds
  // Lat: 17.8 to 24.1, Lng: 80.2 to 84.4
  const mapX = ((p.longitude - 80.2) / (84.4 - 80.2)) * 100;
  const mapY = 100 - (((p.latitude - 17.8) / (24.1 - 17.8)) * 100);

  return {
    id: p.slug, // Use slug as ID for routing
    name: p.name,
    category: p.category?.slug || 'waterfalls',
    district: p.district,
    tagline: p.description,
    coordinates: { lat: p.latitude, lng: p.longitude, mapX, mapY },
    heroImage: p.heroImage || 'https://images.unsplash.com/photo-1506744626753-14010f50220c',
    storyTitle: `The Story of ${p.name}`,
    story: p.history || '',
    timings: '6:00 AM - 6:00 PM', // Fallback
    routes: 'Well connected by road.',
    bestTime: p.bestSeason || 'Year round',
    seasonalAdvice: 'Check local weather before visiting.',
    safety: p.safetyInfo || 'Standard safety precautions apply.',
    nearby: [],
    localInsights: 'A truly magnificent location.',
    ecoGuidance: p.rules || 'Leave no trace.',
    biodiversityScore: 80 + Math.random() * 20,
    crowdCapacity: 500,
    rating: 4.8,
    localFood: 'Local tribal thali available nearby.',
    photographySpots: 'Best during sunrise.',
    audioUrl: p.audioUrl,
    audioNarrator: p.audioNarrator
  };
}

function mapBackendCreator(c: any): Creator {
  return {
    id: c.id,
    name: c.user?.fullName || 'Creator',
    handle: `@${c.user?.fullName?.replace(/\s+/g, '_').toLowerCase() || 'creator'}`,
    avatarUrl: c.user?.avatar || 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79',
    bannerUrl: 'https://images.unsplash.com/photo-1621217646197-0b1961ee4768',
    district: c.district,
    languages: JSON.parse(c.languages || '[]'),
    categories: JSON.parse(c.categories || '[]'),
    bio: c.bio || '',
    verificationBadges: JSON.parse(c.verificationBadges || '[]'),
    followers: c.followers,
    contentCount: c.contentCount,
    engagementScore: c.engagementScore,
    tourismScore: c.tourismScore,
    ecoSafeScore: c.ecoSafeScore,
    socialLinks: {
      instagram: c.instagram,
      youtube: c.youtube
    }
  };
}

export async function fetchPlaces(): Promise<Destination[]> {
  try {
    const res = await fetch(`${API_BASE}/places`, { next: { revalidate: 10 } });
    if (!res.ok) throw new Error('Failed to fetch places');
    const data = await res.json();
    return data.map(mapBackendPlace);
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function fetchPlaceBySlug(slug: string): Promise<Destination | null> {
  try {
    const res = await fetch(`${API_BASE}/places/${slug}`, { next: { revalidate: 10 } });
    if (!res.ok) return null;
    const data = await res.json();
    return mapBackendPlace(data);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function fetchCreators(): Promise<{ creators: Creator[], videos: CreatorVideo[] }> {
  try {
    const res = await fetch(`${API_BASE}/users/creators`, { next: { revalidate: 10 } });
    if (!res.ok) throw new Error('Failed to fetch creators');
    const data = await res.json();
    
    const creators = data.map(mapBackendCreator);
    const videos = data.flatMap((c: any) => c.videos || []);
    
    return { creators, videos };
  } catch (e) {
    console.error(e);
    return { creators: [], videos: [] };
  }
}

export async function fetchCreatorById(id: string): Promise<{ creator: Creator | null, videos: CreatorVideo[] }> {
  try {
    const res = await fetch(`${API_BASE}/users/creators/${id}`, { next: { revalidate: 10 } });
    if (!res.ok) return { creator: null, videos: [] };
    const data = await res.json();
    
    return { 
      creator: mapBackendCreator(data),
      videos: data.videos || []
    };
  } catch (e) {
    console.error(e);
    return { creator: null, videos: [] };
  }
}

// Admin API
export async function deletePlace(id: string, token: string) {
  const res = await fetch(`${API_BASE}/moderation/places/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete place');
  return res.json();
}

export async function deleteCreator(id: string, token: string) {
  const res = await fetch(`${API_BASE}/moderation/creators/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete creator');
  return res.json();
}
