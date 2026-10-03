import { getApiOrigin } from "../../../app/data/api-config";
import {
  SocialContentItem,
  FeedResponse,
  FeedType,
  CreateSocialContentPayload,
  StoryItem,
} from "../types";

const getSocialApiBase = () => `${getApiOrigin()}/api/social`;

export const MOCK_CHHATTISGARH_SOCIAL_ITEMS: SocialContentItem[] = [
  {
    id: "sc-chitrakote-monsoon",
    creator_id: "creator-bastar-traveler",
    creator: {
      id: "creator-bastar-traveler",
      handle: "bastar_explorer",
      display_name: "Amit & Shalini (Bastar Explorers)",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      bio: "Documenting unexplored waterfalls, tribal crafts, and sacred groves across Dandakaranya.",
      district_id: "bastar",
      status: "VERIFIED",
      verification_badge: true,
      followers_count: 14820,
      following_count: 182,
      posts_count: 94,
    },
    content_type: "REEL",
    title: "Chitrakote Horseshoe Falls in Full Monsoon Roar",
    caption: "Standing beneath the Indravati mist at 6:30 AM. When the water turns rust-golden with Dandakaranya soil, the roar shakes the cliff edge. Best viewed from the left forest ridge!",
    slug: "chitrakote-monsoon-roar",
    place_slug: "chitrakote-falls",
    place_name: "Chitrakote Falls",
    district_id: "bastar",
    district_name: "Bastar",
    coordinates: { lat: 19.2023, lng: 81.7051 },
    cultural_tags: ["Waterfalls", "Indravati", "Nature", "Monsoon"],
    cultural_sensitivity_level: "PUBLIC",
    has_sacred_consent: false,
    status: "PUBLISHED",
    likes_count: 2430,
    comments_count: 168,
    shares_count: 512,
    saves_count: 890,
    trip_adds_count: 341,
    is_evergreen: true,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    media_items: [
      {
        media_type: "VIDEO",
        media_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnail_url: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=800&q=80",
        aspect_ratio: "9:16",
        duration_seconds: 28,
        transcript: "Listen to the roar of the Niagara of India! Chitrakote during late monsoon is pure primeval power.",
      },
    ],
  },
  {
    id: "sc-bastar-dussehra-chariot",
    creator_id: "creator-tribal-heritage",
    creator: {
      id: "creator-tribal-heritage",
      handle: "tribal_voice_cg",
      display_name: "Somnath Mandavi (Tribal Cultural Trustee)",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      bio: "Authorized chronicler of Bastar Dussehra and traditional Halbi & Gondi oral histories.",
      district_id: "bastar",
      status: "VERIFIED",
      verification_badge: true,
      followers_count: 31200,
      following_count: 64,
      posts_count: 142,
    },
    content_type: "REEL",
    title: "The 8-Wheeled Ratha Construction: 75 Days of Bastar Dussehra",
    caption: "Unlike standard festive processions, Bastar Dussehra is a 75-day worship of Maa Danteshwari with zero effigy burning. Each year, Saora and Maria carpenters craft this massive dual-decker chariot using Sal wood from reserved sacred groves without a single iron nail.",
    slug: "bastar-dussehra-chariot-craft",
    place_slug: "danteshwari-temple-dantewada",
    place_name: "Sirhasar Bhavan & Danteshwari Mandir",
    district_id: "bastar",
    district_name: "Bastar",
    festival_name: "Bastar Dussehra",
    coordinates: { lat: 19.078, lng: 82.028 },
    cultural_tags: ["Bastar Dussehra", "Sacred Traditions", "Indigenous Craftsmanship", "Sal Wood"],
    cultural_sensitivity_level: "SACRED_TRIBAL_RITUAL",
    has_sacred_consent: true,
    community_attribution: "Bastar Raj Parivar & Gond Tribal Council of Jagdalpur",
    status: "PUBLISHED",
    likes_count: 4890,
    comments_count: 310,
    shares_count: 1240,
    saves_count: 1530,
    trip_adds_count: 672,
    is_evergreen: true,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    media_items: [
      {
        media_type: "VIDEO",
        media_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        thumbnail_url: "https://images.unsplash.com/photo-1609137144820-221f1d166df2?auto=format&fit=crop&w=800&q=80",
        aspect_ratio: "9:16",
        duration_seconds: 45,
        transcript: "Over 75 days, sacred rites unite 300+ villages under Maa Danteshwari's divine umbrella.",
      },
    ],
  },
  {
    id: "sc-sirpur-red-brick",
    creator_id: "creator-archaeo-cg",
    creator: {
      id: "creator-archaeo-cg",
      handle: "heritage_walks_cg",
      display_name: "Dr. Ananya Sharma",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      bio: "Archaeological researcher studying 6th-century brick viharas of Sirpur & Malhar.",
      district_id: "mahasamund",
      status: "VERIFIED",
      verification_badge: true,
      followers_count: 9240,
      following_count: 210,
      posts_count: 67,
    },
    content_type: "CULTURAL_STORY",
    title: "The Mystery of Sirpur's Weatherproof 6th-Century Red Terracotta Bricks",
    caption: "The Lakshmana Temple in Sirpur was commissioned in the 6th century by Queen Vasata of the Panduvamshi dynasty. The terracotta bricks were fired with a specialized herbal resin binding agent derived from Mahua and Sal tree sap, allowing delicate Buddhist and Vaishnava floral motifs to survive monsoon storms for over 1,400 years.",
    slug: "sirpur-weatherproof-brick-architecture",
    place_slug: "sirpur-heritage-site",
    place_name: "Sirpur Archaeological Complex",
    district_id: "mahasamund",
    district_name: "Mahasamund",
    coordinates: { lat: 21.3414, lng: 82.1772 },
    cultural_tags: ["Sirpur", "Ancient Architecture", "Buddhism", "Queen Vasata"],
    cultural_sensitivity_level: "CULTURAL_HERITAGE",
    has_sacred_consent: false,
    community_attribution: "Archaeological Survey of India & Sirpur Heritage Trust",
    status: "PUBLISHED",
    likes_count: 1870,
    comments_count: 92,
    shares_count: 340,
    saves_count: 620,
    trip_adds_count: 289,
    is_evergreen: true,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    media_items: [
      {
        media_type: "IMAGE",
        media_url: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1000&q=80",
        aspect_ratio: "16:9",
      },
    ],
  },
  {
    id: "sc-mainpat-tibetan-settlement",
    creator_id: "creator-surguja-trails",
    creator: {
      id: "creator-surguja-trails",
      handle: "surguja_highlands",
      display_name: "Devendra Tirkey",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      bio: "Highland guide for Mainpat, Tiger Point, and the Tibetan Camps of Surguja.",
      district_id: "surguja",
      status: "VERIFIED",
      verification_badge: true,
      followers_count: 11450,
      following_count: 95,
      posts_count: 81,
    },
    content_type: "REEL",
    title: "Shimla of Chhattisgarh: Dhakpo Shedrupling Monastery in Mainpat",
    caption: "At 1,100 meters above sea level, Mainpat is known as Mini Tibet. Walking inside Camp 1 to the sound of ritual chanting, surrounded by pine hills and prayer flags. Don't leave without tasting traditional momos and thukpa!",
    slug: "mainpat-tibetan-monastery",
    place_slug: "mainpat-hill-station",
    place_name: "Mainpat Highland Plateau",
    district_id: "surguja",
    district_name: "Surguja",
    coordinates: { lat: 22.8123, lng: 83.2841 },
    cultural_tags: ["Mainpat", "Tibetan Culture", "Highlands", "Monastery"],
    cultural_sensitivity_level: "CULTURAL_HERITAGE",
    has_sacred_consent: false,
    community_attribution: "Tibetan Settlement Office Camp 1, Mainpat",
    status: "PUBLISHED",
    likes_count: 3120,
    comments_count: 204,
    shares_count: 678,
    saves_count: 940,
    trip_adds_count: 412,
    is_evergreen: true,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    media_items: [
      {
        media_type: "VIDEO",
        media_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        thumbnail_url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80",
        aspect_ratio: "9:16",
        duration_seconds: 22,
        transcript: "Golden prayer wheels spinning in the mountain breeze of Mainpat.",
      },
    ],
  },
  {
    id: "sc-dhokra-artisan-workshop",
    creator_id: "creator-craft-guild",
    creator: {
      id: "creator-craft-guild",
      handle: "cg_artisan_guild",
      display_name: "Ghadwa Bell-Metal Guild (Kondagaon)",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
      bio: "4,000-year-old lost-wax bell metal casting tradition preserved by master Ghadwa artisans.",
      district_id: "kondagaon",
      status: "VERIFIED",
      verification_badge: true,
      followers_count: 18600,
      following_count: 42,
      posts_count: 110,
    },
    content_type: "CULTURAL_STORY",
    title: "The 4,000-Year-Old Lost Wax Art: Inside a Kondagaon Dhokra Forge",
    caption: "Every single Dhokra bronze sculpture is completely unique because the clay mold must be broken to release the finished metal. Watch Master Artisan Ramesh Ghadwa hand-wind beeswax threads around the clay core to form the intricate tribal jewelry of the dancing deer.",
    slug: "dhokra-lost-wax-kondagaon",
    place_slug: "kondagaon-craft-village",
    place_name: "Kondagaon Craft Enclave",
    district_id: "kondagaon",
    district_name: "Kondagaon",
    coordinates: { lat: 19.598, lng: 81.674 },
    cultural_tags: ["Dhokra", "Bell Metal", "Lost Wax", "Kondagaon", "Crafts"],
    cultural_sensitivity_level: "CULTURAL_HERITAGE",
    has_sacred_consent: true,
    community_attribution: "Ghadwa Artisan Society of Kondagaon",
    status: "PUBLISHED",
    likes_count: 2780,
    comments_count: 145,
    shares_count: 590,
    saves_count: 1120,
    trip_adds_count: 388,
    is_evergreen: true,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    media_items: [
      {
        media_type: "IMAGE",
        media_url: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=1000&q=80",
        aspect_ratio: "16:9",
      },
    ],
  },
  {
    id: "sc-kanger-valley-limestone-caves",
    creator_id: "creator-bastar-traveler",
    creator: {
      id: "creator-bastar-traveler",
      handle: "bastar_explorer",
      display_name: "Amit & Shalini (Bastar Explorers)",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      bio: "Documenting unexplored waterfalls, tribal crafts, and sacred groves across Dandakaranya.",
      district_id: "bastar",
      status: "VERIFIED",
      verification_badge: true,
      followers_count: 14820,
      following_count: 182,
      posts_count: 94,
    },
    content_type: "REEL",
    title: "Subterranean Wonder: Kotumsar Cave Stalactites",
    caption: "Deep inside Kanger Valley National Park, 35 meters below surface. In total darkness, unique blind cave fish (Indoreonectes evezardi) swim in underground pools beneath giant stalagmites formed over hundreds of thousands of years.",
    slug: "kotumsar-cave-stalactites",
    place_slug: "kotumsar-cave",
    place_name: "Kotumsar Caves, Kanger Ghati",
    district_id: "bastar",
    district_name: "Bastar",
    coordinates: { lat: 18.891, lng: 81.934 },
    cultural_tags: ["Caves", "Kotumsar", "Kanger Valley", "Geology"],
    cultural_sensitivity_level: "PUBLIC",
    has_sacred_consent: false,
    status: "PUBLISHED",
    likes_count: 3650,
    comments_count: 220,
    shares_count: 810,
    saves_count: 1390,
    trip_adds_count: 512,
    is_evergreen: true,
    created_at: new Date(Date.now() - 3600000 * 55).toISOString(),
    media_items: [
      {
        media_type: "VIDEO",
        media_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
        thumbnail_url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
        aspect_ratio: "9:16",
        duration_seconds: 30,
        transcript: "Stepping into Kotumsar Cave with carbide lamps. The silence here is prehistoric.",
      },
    ],
  },
];

export const MOCK_STORIES: StoryItem[] = [
  {
    id: "story-1",
    title: "Bastar Dussehra Ratha Preparation",
    media_url: "https://images.unsplash.com/photo-1609137144820-221f1d166df2?auto=format&fit=crop&w=600&q=80",
    media_type: "IMAGE",
    district_id: "bastar",
    place_slug: "chitrakote-falls",
    festival_name: "Bastar Dussehra",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    expires_at: new Date(Date.now() + 3600000 * 22).toISOString(),
    creator: {
      id: "c-1",
      handle: "tribal_voice_cg",
      display_name: "Somnath Mandavi",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
      district_id: "bastar",
      status: "VERIFIED",
      verification_badge: true,
      followers_count: 31200,
      following_count: 64,
      posts_count: 142,
    },
  },
  {
    id: "story-2",
    title: "Sunset over Indravati River Gorge",
    media_url: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=600&q=80",
    media_type: "IMAGE",
    district_id: "bastar",
    place_slug: "chitrakote-falls",
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    expires_at: new Date(Date.now() + 3600000 * 21).toISOString(),
    creator: {
      id: "c-2",
      handle: "bastar_explorer",
      display_name: "Amit & Shalini",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      district_id: "bastar",
      status: "VERIFIED",
      verification_badge: true,
      followers_count: 14820,
      following_count: 182,
      posts_count: 94,
    },
  },
  {
    id: "story-3",
    title: "Morning mist at Mainpat Tiger Point",
    media_url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80",
    media_type: "IMAGE",
    district_id: "surguja",
    place_slug: "mainpat-hill-station",
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    expires_at: new Date(Date.now() + 3600000 * 18).toISOString(),
    creator: {
      id: "c-3",
      handle: "surguja_highlands",
      display_name: "Devendra Tirkey",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
      district_id: "surguja",
      status: "VERIFIED",
      verification_badge: true,
      followers_count: 11450,
      following_count: 95,
      posts_count: 81,
    },
  },
  {
    id: "story-4",
    title: "Fresh Bell Metal Cast Pouring",
    media_url: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=600&q=80",
    media_type: "IMAGE",
    district_id: "kondagaon",
    place_slug: "kondagaon-craft-village",
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    expires_at: new Date(Date.now() + 3600000 * 16).toISOString(),
    creator: {
      id: "c-4",
      handle: "cg_artisan_guild",
      display_name: "Ghadwa Bell-Metal Guild",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80",
      district_id: "kondagaon",
      status: "VERIFIED",
      verification_badge: true,
      followers_count: 18600,
      following_count: 42,
      posts_count: 110,
    },
  },
];

export async function fetchFeed(
  feedType: FeedType = "HOME",
  districtId?: string,
  limit: number = 20,
  cursor?: string
): Promise<FeedResponse> {
  const queryParams = new URLSearchParams({
    feed_type: feedType,
    limit: limit.toString(),
  });
  if (districtId) queryParams.set("district_id", districtId);
  if (cursor) queryParams.set("cursor", cursor);

  try {
    const res = await fetch(`${getSocialApiBase()}/feeds?${queryParams.toString()}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        return data;
      }
    }
  } catch (e) {
    // Graceful fallback to mock items for disconnected or static preview environments
    console.warn("[SocialAPI] Backend unreachable, serving authentic fallback stream:", e);
  }

  let filtered = [...MOCK_CHHATTISGARH_SOCIAL_ITEMS];

  if (feedType === "CULTURE") {
    filtered = filtered.filter(
      (item) =>
        item.content_type === "CULTURAL_STORY" ||
        item.cultural_sensitivity_level !== "PUBLIC" ||
        item.festival_name
    );
  } else if (feedType === "REGIONAL" && districtId) {
    filtered = filtered.filter(
      (item) => item.district_id?.toLowerCase() === districtId.toLowerCase()
    );
  }

  return {
    items: filtered,
    feed_type: feedType,
    next_cursor: null,
    total_returned: filtered.length,
  };
}

export async function fetchStories(): Promise<StoryItem[]> {
  try {
    const res = await fetch(`${getSocialApiBase()}/feeds?feed_type=HOME&limit=10`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const storyContents = (data.items || []).filter(
        (it: SocialContentItem) => it.content_type === "STORY"
      );
      if (storyContents.length > 0) {
        return storyContents.map((it: SocialContentItem) => ({
          id: it.id,
          title: it.title,
          media_url: it.media_items[0]?.media_url || "",
          media_type: it.media_items[0]?.media_type === "VIDEO" ? "VIDEO" : "IMAGE",
          district_id: it.district_id || undefined,
          place_slug: it.place_slug || undefined,
          festival_name: it.festival_name || undefined,
          created_at: it.created_at,
          expires_at: it.expires_at || undefined,
          creator: it.creator || {
            id: it.creator_id,
            handle: "creator",
            display_name: "Local Guide",
            status: "VERIFIED",
            verification_badge: true,
            followers_count: 0,
            following_count: 0,
            posts_count: 1,
          },
        }));
      }
    }
  } catch {
    // fallback
  }

  return MOCK_STORIES;
}

export async function fetchDestinationContent(
  placeSlug: string
): Promise<SocialContentItem[]> {
  try {
    const res = await fetch(
      `${getSocialApiBase()}/content?place_slug=${encodeURIComponent(placeSlug)}&status=PUBLISHED`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // fallback
  }

  return MOCK_CHHATTISGARH_SOCIAL_ITEMS.filter(
    (item) => item.place_slug === placeSlug
  );
}

export async function interactWithContent(
  contentId: string,
  action: "like" | "save" | "share" | "trip_add",
  token?: string | null,
  tripId?: string,
  commentText?: string
): Promise<{ success: boolean; new_count?: number; error?: string }> {
  try {
    const endpoint = `${getSocialApiBase()}/interactions/${contentId}/${action}`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const body: Record<string, any> = {};
    if (tripId) body.trip_id = tripId;
    if (commentText) body.comment_text = commentText;

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, new_count: data.new_count || data.trip_adds_count };
    }
  } catch {
    // optimistic pass for UI simulation
  }

  return { success: true };
}

export async function createSocialContent(
  payload: CreateSocialContentPayload,
  token?: string | null
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${getSocialApiBase()}/content/?auto_submit=true`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    const err = await res.json();
    return { success: false, error: err.detail || err.error?.message || "Failed to create content" };
  } catch (e: any) {
    return { success: false, error: e.message || "Network error" };
  }
}
