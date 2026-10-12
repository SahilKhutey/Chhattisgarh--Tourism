import { SocialFeedTemplate } from './types';

export const STANDARD_SOCIAL_FEED: SocialFeedTemplate = {
  id: 'social-standard',
  name: 'Standard Social Feed',
  layout: 'standard-grid',
  columns: {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  },
  card: {
    showCreator: true,
    showPlatform: true,
    showContentType: true,
    showLocation: true,
    showDate: true,
    showDescription: false,
  },
  interaction: {
    openMode: 'original-source',
  },
  filters: {
    platform: true,
    contentType: true,
    district: true,
    creator: true,
  },
};

export const MASONRY_SOCIAL_FEED: SocialFeedTemplate = {
  id: 'social-masonry',
  name: 'Masonry Social Feed',
  layout: 'masonry',
  columns: {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  },
  card: {
    showCreator: true,
    showPlatform: true,
    showContentType: true,
    showLocation: true,
    showDate: true,
    showDescription: true,
  },
  interaction: {
    openMode: 'original-source',
  },
  filters: {
    platform: true,
    contentType: true,
    district: true,
    creator: true,
  },
};

export const FEATURED_GRID_FEED: SocialFeedTemplate = {
  id: 'social-featured',
  name: 'Featured Social Grid',
  layout: 'featured-grid',
  columns: {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  },
  card: {
    showCreator: true,
    showPlatform: true,
    showContentType: true,
    showLocation: true,
    showDate: true,
    showDescription: false,
  },
  interaction: {
    openMode: 'original-source',
  },
  filters: {
    platform: true,
    contentType: true,
    district: true,
    creator: true,
  },
};

export const REGIONAL_SHOWCASE_FEED: SocialFeedTemplate = {
  id: 'regional-showcase',
  name: 'Regional Showcase Feed',
  layout: 'regional-showcase',
  columns: {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  },
  card: {
    showCreator: true,
    showPlatform: true,
    showContentType: true,
    showLocation: true,
    showDate: true,
    showDescription: true,
  },
  interaction: {
    openMode: 'original-source',
  },
  filters: {
    platform: true,
    contentType: true,
    district: false,
    creator: true,
  },
};

export const COMPACT_GRID_FEED: SocialFeedTemplate = {
  id: 'social-compact',
  name: 'Compact Destination Feed',
  layout: 'compact-grid',
  columns: {
    mobile: 2,
    tablet: 2,
    desktop: 3,
  },
  card: {
    showCreator: true,
    showPlatform: true,
    showContentType: true,
    showLocation: false,
    showDate: false,
    showDescription: false,
  },
  interaction: {
    openMode: 'original-source',
  },
  filters: {
    platform: false,
    contentType: false,
    district: false,
    creator: false,
  },
};

const TEMPLATE_REGISTRY: Record<string, SocialFeedTemplate> = {
  'social-standard': STANDARD_SOCIAL_FEED,
  'standard-grid': STANDARD_SOCIAL_FEED,
  'social-masonry': MASONRY_SOCIAL_FEED,
  masonry: MASONRY_SOCIAL_FEED,
  'social-featured': FEATURED_GRID_FEED,
  'featured-grid': FEATURED_GRID_FEED,
  'regional-showcase': REGIONAL_SHOWCASE_FEED,
  'social-compact': COMPACT_GRID_FEED,
  'compact-grid': COMPACT_GRID_FEED,
};

export function getSocialTemplate(templateIdOrLayout?: string | null): SocialFeedTemplate {
  if (!templateIdOrLayout) {
    return STANDARD_SOCIAL_FEED;
  }
  return TEMPLATE_REGISTRY[templateIdOrLayout.toLowerCase()] || STANDARD_SOCIAL_FEED;
}
