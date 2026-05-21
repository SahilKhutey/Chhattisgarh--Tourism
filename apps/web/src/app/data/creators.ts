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
  engagementScore: number; // out of 100
  tourismScore: number; // out of 100
  ecoSafeScore: number; // out of 100
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

export const CREATORS: Creator[] = [
  {
    id: "c1",
    name: "36Garh Traveller",
    handle: "@36garh_travel",
    avatarUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1621217646197-0b1961ee4768?auto=format&fit=crop&w=1200&q=80",
    district: "Bastar",
    languages: ["Hindi", "English"],
    categories: ["Nature", "Adventure", "Hidden Places"],
    bio: "Exploring the deepest jungles and roaring waterfalls of Chhattisgarh. Documenting the unseen.",
    verificationBadges: ["BLUE", "GREEN"],
    followers: "245K",
    contentCount: 312,
    engagementScore: 92,
    tourismScore: 98,
    ecoSafeScore: 95,
    socialLinks: { instagram: "https://instagram.com", youtube: "https://youtube.com" }
  },
  {
    id: "c2",
    name: "Being Chhattisgarhiya",
    handle: "@being_cg",
    avatarUrl: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=150&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=80",
    district: "Raipur",
    languages: ["Chhattisgarhi", "Hindi"],
    categories: ["Culture", "Local Stories", "Village"],
    bio: "Pioneers of the Tulsi Village creator ecosystem. Showcasing the true Chhattisgarhi identity and folk roots.",
    verificationBadges: ["BLUE", "CULTURAL"],
    followers: "890K",
    contentCount: 540,
    engagementScore: 98,
    tourismScore: 85,
    ecoSafeScore: 80,
    socialLinks: { youtube: "https://youtube.com" }
  },
  {
    id: "c3",
    name: "Bastar Times",
    handle: "@bastartimes",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1596423735880-5c6fa0d17d09?auto=format&fit=crop&w=1200&q=80",
    district: "Jagdalpur",
    languages: ["Hindi", "Chhattisgarhi"],
    categories: ["Documentary", "Tribal Traditions", "History"],
    bio: "Independent regional storytelling capturing the essence, struggles, and pure beauty of the Bastar division.",
    verificationBadges: ["CULTURAL"],
    followers: "120K",
    contentCount: 145,
    engagementScore: 88,
    tourismScore: 90,
    ecoSafeScore: 92,
    socialLinks: { instagram: "https://instagram.com" }
  },
  {
    id: "c4",
    name: "Raipur Foodie Love",
    handle: "@raipur_foodie",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
    district: "Raipur",
    languages: ["Hindi", "English"],
    categories: ["Food", "Street Food", "Cafes"],
    bio: "Exploring the best flavors across Chhattisgarh. From roadside Phuchka to premium authentic Chhattisgarhi Thalis.",
    verificationBadges: ["BLUE"],
    followers: "350K",
    contentCount: 890,
    engagementScore: 94,
    tourismScore: 70,
    ecoSafeScore: 60,
    socialLinks: { instagram: "https://instagram.com" }
  },
  {
    id: "c5",
    name: "Aaru Sahu",
    handle: "@aaru_sings",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80",
    district: "Durg",
    languages: ["Chhattisgarhi"],
    categories: ["Folk Music", "Culture", "Festivals"],
    bio: "Voice of Chhattisgarh. Preserving folk music and traditional arts for the new generation.",
    verificationBadges: ["BLUE", "CULTURAL"],
    followers: "1.2M",
    contentCount: 200,
    engagementScore: 99,
    tourismScore: 80,
    ecoSafeScore: 75,
    socialLinks: { youtube: "https://youtube.com", instagram: "https://instagram.com" }
  }
];

export const CREATOR_VIDEOS: CreatorVideo[] = [
  {
    id: "v1",
    creatorId: "c1",
    thumbnailUrl: "https://images.unsplash.com/photo-1544473244-f6895e69da8a?auto=format&fit=crop&w=600&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Chitrakote Falls at Sunrise - The Niagara of India 🌊",
    location: "Chitrakote Falls",
    district: "Bastar",
    category: "Waterfalls",
    views: "214K",
    duration: "0:59",
    language: "Hindi",
    isTrending: true
  },
  {
    id: "v2",
    creatorId: "c2",
    thumbnailUrl: "https://images.unsplash.com/photo-1596423735880-5c6fa0d17d09?auto=format&fit=crop&w=600&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "The hidden Haat Bazaars of Bastar - Exploring rural economics",
    location: "Jagdalpur",
    district: "Bastar",
    category: "Culture",
    views: "89K",
    duration: "1:15",
    language: "Chhattisgarhi"
  },
  {
    id: "v3",
    creatorId: "c4",
    thumbnailUrl: "https://images.unsplash.com/photo-1620063991217-106da23555db?auto=format&fit=crop&w=600&q=80",
    title: "Trying Authentic Bastar Red Ant Chutney (Chaprah) 🐜",
    location: "Bastar",
    district: "Bastar",
    category: "Food",
    views: "520K",
    duration: "0:45",
    language: "Hindi",
    isTrending: true
  },
  {
    id: "v4",
    creatorId: "c1",
    thumbnailUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
    title: "Trekking the Dense Forests of Mainpat (Mini Tibet) 🌲",
    location: "Mainpat",
    district: "Sarguja",
    category: "Trekking",
    views: "112K",
    duration: "1:30",
    language: "English",
    isHiddenGem: true
  },
  {
    id: "v5",
    creatorId: "c3",
    thumbnailUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80",
    title: "Ancient Bhoramdeo Temple - The Khajuraho of Chhattisgarh 🛕",
    location: "Bhoramdeo",
    district: "Kabirdham",
    category: "History",
    views: "34K",
    duration: "2:10",
    language: "Hindi"
  },
  {
    id: "v6",
    creatorId: "c5",
    thumbnailUrl: "https://images.unsplash.com/photo-1571597193617-3bfdf62886f4?auto=format&fit=crop&w=600&q=80",
    title: "Bastar Dussehra - The longest festival in the world 🎨",
    location: "Jagdalpur",
    district: "Bastar",
    category: "Festivals",
    views: "210K",
    duration: "0:55",
    language: "Chhattisgarhi",
    isTrending: true
  },
  {
    id: "v7",
    creatorId: "c1",
    thumbnailUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
    title: "Kanger Valley National Park - Hidden Caves & Wildlife 🦇",
    location: "Kanger Valley",
    district: "Bastar",
    category: "Eco Tourism",
    views: "78K",
    duration: "1:42",
    language: "English",
    isHiddenGem: true
  },
  {
    id: "v8",
    creatorId: "c4",
    thumbnailUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
    title: "Local Street Food Tour in Raipur City 🥘",
    location: "Raipur",
    district: "Raipur",
    category: "Food",
    views: "440K",
    duration: "1:20",
    language: "Hindi"
  }
];
