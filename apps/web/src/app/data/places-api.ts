import { DESTINATIONS, Destination } from './destinations';

const API_BASE_URL = 'http://localhost:4000/api/v1';

export async function fetchAllPlaces(categorySlug?: string, district?: string): Promise<Destination[]> {
  try {
    const queryParams = new URLSearchParams();
    if (categorySlug) queryParams.append('category', categorySlug);
    if (district) queryParams.append('district', district);

    const response = await fetch(`${API_BASE_URL}/places?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Map the NestJS Places data fields to Next.js Destinations properties
    return data.map((item: Record<string, unknown>) => mapToDestination(item));
  } catch (error) {
    console.warn('Backend API unavailable. Falling back to local static Destinations mock database...', error);
    
    // Fallback: Filter mock data in memory
    return DESTINATIONS.filter(item => {
      const matchCategory = !categorySlug || item.category === categorySlug;
      const matchDistrict = !district || item.district === district;
      return matchCategory && matchDistrict;
    });
  }
}

export async function fetchPlaceBySlug(slug: string): Promise<Destination> {
  try {
    const response = await fetch(`${API_BASE_URL}/places/${slug}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return mapToDestination(data);
  } catch (error) {
    console.warn(`Backend API unavailable. Fetching slug '${slug}' from mock database...`, error);
    
    const place = DESTINATIONS.find(item => item.id === slug || item.id.replace('-falls', '') === slug.replace('-falls', ''));
    if (!place) {
      throw new Error(`Mock destination with slug '${slug}' not found.`);
    }
    return place;
  }
}

export async function fetchNearbyPlaces(lat: number, lng: number, radiusKm: number = 50): Promise<Record<string, unknown>[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/places/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Backend API unavailable. Calculating radial distance in local mock dataset...', error);
    
    // Fallback: Mathematically compute and sort distances in the client sandbox
    return DESTINATIONS.map(place => {
      const dist = calculateHaversineDistance(lat, lng, place.coordinates.lat, place.coordinates.lng);
      return {
        id: place.id,
        name: place.name,
        slug: place.id,
        tagline: place.tagline,
        distance_km: dist,
        coordinates: place.coordinates,
      };
    })
    .filter(item => item.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);
  }
}

// Map database fields to client frontend interfaces
function mapToDestination(item: Record<string, unknown>): Destination {
  return {
    id: (item.slug as string) || (item.id as string),
    name: item.name as string,
    category: ((item.category as Record<string, unknown>)?.slug || 'waterfalls') as Destination['category'],
    tagline: (item.tagline as string) || 'Pristine discovery coordinates in Chhattisgarh',
    coordinates: {
      lat: (item.latitude as number) || 0,
      lng: (item.longitude as number) || 0,
      mapX: (item.coordinates as { mapX?: number })?.mapX || 45,
      mapY: (item.coordinates as { mapY?: number })?.mapY || 55,
    },
    heroImage: (item.heroImage as string) || (item.hero_image as string) || 'https://images.unsplash.com/photo-example',
    storyTitle: (item.storyTitle as string) || 'Regional Folklore Legends',
    story: (item.description as string) || (item.history as string) || 'Folklore lore and local narratives details...',
    timings: '08:00 AM - 06:00 PM (Everyday)',
    routes: 'Paved transit access is open from municipal capitals.',
    bestTime: (item.bestSeason as string) || 'All Seasons',
    seasonalAdvice: 'Check active rain corridors during peak monsoon.',
    safety: (item.safetyInfo as string) || 'Stick to designated paths.',
    nearby: ['Local Villages', 'Regional Waterfalls'],
    localInsights: 'Coordinate with registered community guides.',
    ecoGuidance: (item.rules as string) || 'Littering is strictly prohibited.',
    biodiversityScore: 85,
    crowdCapacity: 400,
    rating: 4.8,
    localFood: 'Traditional Chhattisgarhi meals.',
    photographySpots: 'Scenic main viewpoints.',
  };
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
