/**
 * Social Engine Phase 8 Navigation and URL Building Helpers
 * Ensures consistent routing throughout the regional tourism social experience.
 */

export interface SocialFeedUrlParams {
  tab?: string | null;
  platform?: string | null;
  type?: string | null;
  district?: string | null;
  tag?: string | null;
  sort?: string | null;
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Path to Social discovery homepage.
 */
export function getSocialHomePath(): string {
  return '/social';
}

/**
 * Path to Social full feed with optional query filters.
 */
export function getSocialFeedPath(params?: SocialFeedUrlParams): string {
  if (!params) {
    return '/social/feed';
  }
  return buildSocialFeedUrl(params);
}

/**
 * Path to a specific content detail page.
 */
export function getSocialContentPath(id: string): string {
  return `/social/content/${encodeURIComponent(id)}`;
}

/**
 * Path to verified creator directory.
 */
export function getSocialCreatorsIndexPath(): string {
  return '/social/creators';
}

/**
 * Path to creator portfolio and feed.
 */
export function getSocialCreatorPath(slug: string): string {
  return `/social/creators/${encodeURIComponent(slug.toLowerCase().replace(/^@/, ''))}`;
}

/**
 * Path to district social stories hub.
 */
export function getSocialDistrictPath(districtSlug: string): string {
  return `/social/districts/${encodeURIComponent(districtSlug.toLowerCase())}`;
}

/**
 * Path to specific place/destination social hub.
 */
export function getSocialPlacePath(placeSlug: string): string {
  return `/social/places/${encodeURIComponent(placeSlug.toLowerCase())}`;
}

/**
 * Link into official Tourism destination page.
 */
export function getTourismDestinationPath(destinationSlug: string): string {
  return `/destinations/${encodeURIComponent(destinationSlug.toLowerCase())}`;
}

/**
 * Link into official Tourism itinerary planner.
 */
export function getTourismItineraryPath(destinationSlug?: string): string {
  if (destinationSlug) {
    return `/itineraries?destination=${encodeURIComponent(destinationSlug.toLowerCase())}`;
  }
  return '/itineraries';
}

/**
 * Link into official Tourism interactive map.
 */
export function getTourismMapPath(placeSlug?: string): string {
  if (placeSlug) {
    return `/map?place=${encodeURIComponent(placeSlug.toLowerCase())}`;
  }
  return '/map';
}

/**
 * Link into official Tourism planner for trip integration.
 */
export function getTourismPlannerPath(placeSlug?: string): string {
  if (placeSlug) {
    return `/plan?place=${encodeURIComponent(placeSlug.toLowerCase())}`;
  }
  return '/plan';
}

/**
 * Build a canonical query string URL for the social feed.
 */
export function buildSocialFeedUrl(params: Record<string, string | number | boolean | undefined | null>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'tab' && value === 'all') {
        // Skip default tab
        return;
      }
      searchParams.set(key, String(value).toLowerCase());
    }
  });

  const query = searchParams.toString();
  return query ? `/social/feed?${query}` : '/social/feed';
}
