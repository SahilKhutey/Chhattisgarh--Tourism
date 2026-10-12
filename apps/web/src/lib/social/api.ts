import {
  SocialContent,
  SocialCreator,
  SocialFeedQuery,
  SocialFeedResponse,
} from './types';
import { MOCK_CREATORS, MOCK_SOCIAL_CONTENT } from './mock-data';

const BASE_API_URL =
  typeof window === 'undefined'
    ? process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
    : '';

/**
 * Filter mock items locally when backend is unreachable or during test execution.
 */
export function filterMockSocialContent(params: SocialFeedQuery): SocialFeedResponse {
  let filtered = [...MOCK_SOCIAL_CONTENT];

  if (params.platform) {
    const p = params.platform.toUpperCase();
    filtered = filtered.filter(
      (item) => item.provider && item.provider.toUpperCase() === p
    );
  }

  if (params.contentType) {
    const ct = params.contentType.toUpperCase();
    filtered = filtered.filter(
      (item) => item.content_type && item.content_type.toUpperCase() === ct
    );
  }

  if (params.districtId) {
    const d = params.districtId.toLowerCase();
    filtered = filtered.filter(
      (item) => item.district_id && item.district_id.toLowerCase() === d
    );
  }

  if (params.placeSlug) {
    const ps = params.placeSlug.toLowerCase();
    filtered = filtered.filter(
      (item) => item.place_slug && item.place_slug.toLowerCase() === ps
    );
  }

  if (params.creatorHandle) {
    const h = params.creatorHandle.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.creator?.handle.toLowerCase() === h ||
        item.creator_id.toLowerCase() === h
    );
  }

  if (params.culturalTag) {
    const tag = params.culturalTag.toLowerCase();
    filtered = filtered.filter((item) =>
      item.cultural_tags?.some((t) => t.toLowerCase().includes(tag))
    );
  }

  // Anti-monopoly creator diversity (max 2 items per creator for HOME/EXPLORE)
  if (params.enableDiversity !== false && (!params.districtId && !params.creatorHandle && !params.placeSlug)) {
    const counts: Record<string, number> = {};
    const primary: SocialContent[] = [];
    const secondary: SocialContent[] = [];

    for (const item of filtered) {
      const cId = item.creator_id;
      counts[cId] = (counts[cId] || 0) + 1;
      if (counts[cId] <= 2) {
        primary.push(item);
      } else {
        secondary.push(item);
      }
    }
    filtered = [...primary, ...secondary];
  }

  const offset = params.offset || 0;
  const limit = params.limit || 20;
  const sliced = filtered.slice(offset, offset + limit);
  const nextCursor =
    offset + limit < filtered.length ? String(offset + limit) : null;

  return {
    items: sliced,
    next_cursor: nextCursor,
    total_estimate: filtered.length,
    filters: {
      platform: params.platform || undefined,
      content_type: params.contentType || undefined,
      district_id: params.districtId || undefined,
      place_slug: params.placeSlug || undefined,
      creator_id: params.creatorHandle || undefined,
    },
  };
}

/**
 * Fetch consumer-facing social feed.
 * Follows architectural invariant: Consumes canonical SocialContent only, never third-party APIs.
 */
export async function getSocialFeed(
  params: SocialFeedQuery = {}
): Promise<SocialFeedResponse> {
  const search = new URLSearchParams();

  if (params.platform) search.set('platform', params.platform);
  if (params.contentType) search.set('content_type', params.contentType);
  if (params.districtId) search.set('district_id', params.districtId);
  if (params.placeSlug) search.set('place_slug', params.placeSlug);
  if (params.creatorHandle) search.set('creator', params.creatorHandle);
  if (params.cursor) search.set('cursor', params.cursor);
  if (params.offset !== undefined) search.set('offset', String(params.offset));
  if (params.limit !== undefined) search.set('limit', String(params.limit));
  if (params.enableDiversity !== undefined) {
    search.set('enable_diversity', String(params.enableDiversity));
  }

  const url = `${BASE_API_URL}/api/social/feed?${search.toString()}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 180 },
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return {
          items: data,
          next_cursor: null,
          total_estimate: data.length,
          filters: {
            platform: params.platform || undefined,
            content_type: params.contentType || undefined,
            district_id: params.districtId || undefined,
          },
        };
      }
      if (data && Array.isArray(data.items)) {
        return data as SocialFeedResponse;
      }
    }
  } catch {
    // Graceful fallback to regional mock items
  }

  return filterMockSocialContent(params);
}

/**
 * Fetch focused SocialContent by ID or slug.
 */
export async function getSocialContentById(
  idOrSlug: string
): Promise<SocialContent> {
  const url = `${BASE_API_URL}/api/social/content/${encodeURIComponent(idOrSlug)}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && (data.id || data.slug)) {
        return data as SocialContent;
      }
    }
  } catch {
    // Fallback
  }

  const match = MOCK_SOCIAL_CONTENT.find(
    (c) => c.id === idOrSlug || c.slug === idOrSlug
  );

  if (match) return match;

  throw new Error(`SocialContent not found for: ${idOrSlug}`);
}

/**
 * Fetch all curated social content by a specific creator.
 */
export async function getCreatorFeed(
  creatorHandle: string,
  params: Partial<SocialFeedQuery> = {}
): Promise<SocialFeedResponse> {
  return getSocialFeed({
    ...params,
    creatorHandle,
    enableDiversity: false,
  });
}

/**
 * Fetch all curated social content for a district.
 */
export async function getDistrictSocialFeed(
  districtSlug: string,
  params: Partial<SocialFeedQuery> = {}
): Promise<SocialFeedResponse> {
  return getSocialFeed({
    ...params,
    districtId: districtSlug,
    enableDiversity: false,
  });
}

/**
 * Fetch all curated social content for a destination place.
 */
export async function getPlaceSocialFeed(
  placeSlug: string,
  params: Partial<SocialFeedQuery> = {}
): Promise<SocialFeedResponse> {
  return getSocialFeed({
    ...params,
    placeSlug,
    enableDiversity: false,
  });
}

/**
 * Fetch verified regional creators list.
 */
export async function getPublicCreators(
  districtId?: string,
  limit: number = 20
): Promise<SocialCreator[]> {
  const search = new URLSearchParams();
  if (districtId) search.set('district_id', districtId);
  search.set('limit', String(limit));

  const url = `${BASE_API_URL}/api/social/creators?${search.toString()}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 600 },
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data as SocialCreator[];
      }
    }
  } catch {
    // Fallback
  }

  let creators = [...MOCK_CREATORS];
  if (districtId) {
    creators = creators.filter(
      (c) => c.district_id && c.district_id.toLowerCase() === districtId.toLowerCase()
    );
  }
  return creators.slice(0, limit);
}

/**
 * Fetch a single creator profile by handle or ID.
 */
export async function getCreatorByHandle(
  handleOrId: string
): Promise<SocialCreator> {
  const cleanHandle = handleOrId.replace(/^@/, '');
  const url = `${BASE_API_URL}/api/social/creators/${encodeURIComponent(cleanHandle)}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && (data.id || data.handle)) {
        return data as SocialCreator;
      }
    }
  } catch {
    // Fallback
  }

  const match = MOCK_CREATORS.find(
    (c) =>
      c.handle.toLowerCase() === cleanHandle.toLowerCase() ||
      c.id.toLowerCase() === cleanHandle.toLowerCase()
  );

  if (match) return match;

  throw new Error(`SocialCreator not found for handle: ${handleOrId}`);
}

/**
 * Section 10.25 Unified Social Client API surface
 */
export const socialApi = {
  getFeed: getSocialFeed,
  getContent: getSocialContentById,
  getCreators: getPublicCreators,
  getCreator: getCreatorByHandle,
  getDistrictContent: getDistrictSocialFeed,
  getPlaceContent: getPlaceSocialFeed,
};

