export type SocialPlatform = 'INSTAGRAM' | 'YOUTUBE' | 'INTERNAL';

export type SocialContentType =
  | 'POST'
  | 'REEL'
  | 'STORY'
  | 'ARTICLE'
  | 'VIDEO'
  | 'SHORT'
  | 'CULTURAL_STORY';

export type CulturalSensitivityLevel =
  | 'PUBLIC'
  | 'STANDARD'
  | 'CULTURAL_HERITAGE'
  | 'SACRED_TRIBAL_RITUAL';

export type ContentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'HIDDEN'
  | 'EXPIRED';

export type FeedLayoutType =
  | 'standard-grid'
  | 'masonry'
  | 'featured-grid'
  | 'regional-showcase'
  | 'compact-grid';

export interface SocialMediaItem {
  id?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  media_url: string;
  thumbnail_url?: string | null;
  aspect_ratio?: '9:16' | '16:9' | '1:1' | '4:5' | '4:3' | string;
  duration_seconds?: number | null;
  language?: string;
  transcript?: string | null;
}

export interface SocialTourismContext {
  district_id?: string | null;
  tourism_zone_id?: string | null;
  place_id?: string | null;
  place_slug?: string | null;
  place_name?: string | null;
  experience_id?: string | null;
  festival_id?: string | null;
  festival_name?: string | null;
  culture_id?: string | null;
  confidence?: number;
  source?: string;
}

export interface TourismReference {
  type: 'place' | 'district' | 'festival' | 'experience' | 'route';
  id?: string | null;
  slug?: string | null;
  name: string;
  url: string;
}

export interface SocialCreator {
  id: string;
  handle: string;
  display_name: string;
  avatar_url?: string | null;
  profile_image_url?: string | null;
  bio?: string | null;
  district_id?: string | null;
  is_verified: boolean;
  content_count?: number;
  platforms?: SocialPlatform[];
}

export interface SocialContent {
  id: string;
  creator_id: string;
  creator?: SocialCreator;
  creator_name?: string | null;
  content_type: SocialContentType;
  title: string;
  caption: string;
  description?: string | null;
  slug: string;

  // Tourism Graph Attributes
  district_id: string;
  tourism_zone_id?: string | null;
  place_id?: string | null;
  place_slug?: string | null;
  place_name?: string | null;
  route_id?: string | null;
  experience_id?: string | null;
  festival_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  tourism_context?: SocialTourismContext | null;
  tourism_references?: TourismReference[];

  // Cultural & Taxonomy
  cultural_tags?: string[];
  tourism_tags?: string[];
  hashtags?: string[];
  language?: string;
  cultural_sensitivity?: CulturalSensitivityLevel;

  // Curated Provider Invariants
  provider?: SocialPlatform | string | null;
  platform?: SocialPlatform | string | null;
  provider_content_id?: string | null;
  source_url: string;
  thumbnail_url?: string | null;
  original_platform_action_label?: string | null;
  duration_seconds?: number | null;
  aspect_ratio?: string | null;

  // Editorial & Presentation Flags
  is_featured?: boolean;
  priority?: number;
  is_evergreen?: boolean;
  published_at?: string | null;
  media_items?: SocialMediaItem[];
}

export interface SocialFeedTemplate {
  id: string;
  name: string;
  layout: FeedLayoutType;
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  card: {
    showCreator: boolean;
    showPlatform: boolean;
    showContentType: boolean;
    showLocation: boolean;
    showDate: boolean;
    showDescription: boolean;
  };
  interaction: {
    openMode: 'original-source';
  };
  filters: {
    platform: boolean;
    contentType: boolean;
    district: boolean;
    creator: boolean;
  };
}

export interface SocialFeedQuery {
  platform?: string | null;
  contentType?: string | null;
  districtId?: string | null;
  placeSlug?: string | null;
  creatorHandle?: string | null;
  culturalTag?: string | null;
  cursor?: string | null;
  offset?: number;
  limit?: number;
  enableDiversity?: boolean;
  feedType?: 'HOME' | 'EXPLORE' | 'REGIONAL' | 'CULTURE';
}

export interface SocialFeedResponse {
  items: SocialContent[];
  next_cursor: string | null;
  total_estimate?: number;
  filters: {
    platform?: string;
    content_type?: string;
    creator_id?: string;
    district_id?: string;
    tourism_zone_id?: string;
    place_slug?: string;
  };
}

export interface FeedPolicy {
  maxItemsPerCreator?: number;
  maxItemsPerDistrict?: number;
  platformWeights?: Record<SocialPlatform, number>;
}
