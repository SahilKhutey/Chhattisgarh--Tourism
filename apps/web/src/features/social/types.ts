export type ContentType = 
  | 'POST' 
  | 'VIDEO' 
  | 'REEL' 
  | 'STORY' 
  | 'JOURNAL' 
  | 'CULTURAL_STORY';

export type CreatorStatus = 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';

export type ContentStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'APPROVED' 
  | 'PUBLISHED' 
  | 'HIDDEN' 
  | 'ARCHIVED' 
  | 'EXPIRED' 
  | 'REJECTED';

export type CulturalSensitivityLevel = 
  | 'PUBLIC' 
  | 'CULTURAL_HERITAGE' 
  | 'SACRED_TRIBAL_RITUAL';

export type FeedType = 'HOME' | 'EXPLORE' | 'REGIONAL' | 'CULTURE';

export interface SocialMediaItem {
  id?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  media_url: string;
  thumbnail_url?: string | null;
  aspect_ratio?: '9:16' | '16:9' | '1:1' | '4:3' | string;
  duration_seconds?: number | null;
  transcript?: string | null;
}

export interface CreatorProfile {
  id: string;
  user_id?: string;
  handle: string;
  display_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  district_id?: string | null;
  languages?: string[];
  categories?: string[];
  status: CreatorStatus;
  verification_badge: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at?: string;
}

export interface SocialContentItem {
  id: string;
  creator_id: string;
  creator?: CreatorProfile;
  content_type: ContentType;
  title: string;
  caption?: string | null;
  slug: string;
  place_slug?: string | null;
  place_name?: string | null;
  place_id?: string | null;
  district_id?: string | null;
  district_name?: string | null;
  route_id?: string | null;
  festival_name?: string | null;
  coordinates?: { lat: number; lng: number } | null;
  cultural_tags?: string[];
  cultural_sensitivity_level: CulturalSensitivityLevel;
  has_sacred_consent: boolean;
  community_attribution?: string | null;
  status: ContentStatus;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  trip_adds_count: number;
  is_liked_by_user?: boolean;
  is_saved_by_user?: boolean;
  is_evergreen: boolean;
  expires_at?: string | null;
  created_at: string;
  media_items: SocialMediaItem[];
}

export interface StoryItem {
  id: string;
  creator: CreatorProfile;
  title: string;
  media_url: string;
  media_type: 'IMAGE' | 'VIDEO';
  district_id?: string;
  place_slug?: string;
  festival_name?: string;
  expires_at?: string;
  created_at: string;
}

export interface FeedResponse {
  items: SocialContentItem[];
  feed_type: FeedType;
  next_cursor?: string | null;
  total_returned: number;
}

export interface CreateSocialContentPayload {
  content_type: ContentType;
  title: string;
  caption?: string;
  district_id?: string;
  place_slug?: string;
  route_id?: string;
  festival_name?: string;
  cultural_tags?: string[];
  cultural_sensitivity_level?: CulturalSensitivityLevel;
  has_sacred_consent?: boolean;
  community_attribution?: string;
  media_items: Array<{
    media_type: 'IMAGE' | 'VIDEO' | 'AUDIO';
    media_url: string;
    thumbnail_url?: string;
    aspect_ratio?: string;
    duration_seconds?: number;
  }>;
}
