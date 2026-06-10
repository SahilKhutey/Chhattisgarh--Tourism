export interface FallbackPlaceSeed {
  id: string;
  slug: string;
  name: string;
  district: string;
  category: string;
  description: string;
  history: string;
  latitude: number;
  longitude: number;
  heroImage: string;
  bestSeason: string;
  safetyInfo: string;
  rules: string;
  media?: Array<{ id: string; url: string; type: string }>;
}

export const fallbackPlaceSeeds: FallbackPlaceSeed[] = [
  {
    id: "fallback-chitrakote-falls",
    slug: "chitrakote-falls",
    name: "Chitrakote Falls",
    district: "Bastar",
    category: "waterfalls",
    description: "India's broad horseshoe waterfall surrounded by deep forest corridors and misty viewpoints.",
    history: "A flagship Bastar destination known for dramatic monsoon flow, community-guided viewpoints, and river canyon photography.",
    latitude: 19.2074,
    longitude: 81.7014,
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chitrakot_waterfalls.JPG/1280px-Chitrakot_waterfalls.JPG",
    bestSeason: "Monsoon to winter",
    safetyInfo: "Use designated viewpoints and avoid slippery rock edges during heavy flow.",
    rules: "Respect barrier lines, avoid littering, and follow local guide advisories.",
  },
  {
    id: "fallback-tirathgarh-falls",
    slug: "tirathgarh-falls",
    name: "Tirathgarh Falls",
    district: "Bastar",
    category: "waterfalls",
    description: "Tiered waterfall inside Kanger Valley with dense greenery, steps, and scenic spray zones.",
    history: "A year-round draw near Kanger Valley, especially valued for its layered rock formations and forest setting.",
    latitude: 18.9172,
    longitude: 81.9342,
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/1/19/Kanger_valley_National_Park.png",
    bestSeason: "Monsoon and winter",
    safetyInfo: "Take extra care on wet steps and keep children close near the lower pools.",
    rules: "Stay on marked paths and avoid entering restricted cliff areas.",
  },
  {
    id: "fallback-kanger-valley",
    slug: "kanger-valley",
    name: "Kanger Valley National Park",
    district: "Bastar",
    category: "forests",
    description: "A protected biodiversity corridor known for caves, waterfalls, forests, and wildlife habitats.",
    history: "One of Chhattisgarh's most important conservation zones, spanning forest, cave, and river ecosystems.",
    latitude: 18.7833,
    longitude: 82.0167,
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/1/19/Kanger_valley_National_Park.png",
    bestSeason: "October to March",
    safetyInfo: "Travel with approved permits and avoid isolated forest movement without local guidance.",
    rules: "Maintain silence, avoid flash around wildlife, and follow park-entry restrictions.",
  },
  {
    id: "fallback-bhoramdeo-temple",
    slug: "bhoramdeo-temple",
    name: "Bhoramdeo Temple",
    district: "Kabirdham",
    category: "temples",
    description: "An intricately carved temple complex framed by hills, forest edges, and heritage architecture.",
    history: "Often described as the Khajuraho of Chhattisgarh, celebrated for its stone craftsmanship and heritage value.",
    latitude: 22.1182,
    longitude: 81.2808,
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bhoramdeo_Temple%2C_Kawardha.jpg/1280px-Bhoramdeo_Temple%2C_Kawardha.jpg",
    bestSeason: "October to February",
    safetyInfo: "Wear stable footwear and respect protected monument zones.",
    rules: "No defacement, no littering, and follow site heritage guidelines.",
  },
  {
    id: "fallback-danteshwari-temple",
    slug: "danteshwari-temple",
    name: "Danteshwari Temple",
    district: "Dantewada",
    category: "temples",
    description: "A major spiritual landmark with strong regional identity, ritual significance, and heritage architecture.",
    history: "A revered temple of Bastar's cultural landscape and a frequent anchor point for heritage tourism.",
    latitude: 18.8964,
    longitude: 81.3493,
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Danteswari_Temple_0034.jpg/1280px-Danteswari_Temple_0034.jpg",
    bestSeason: "October to March",
    safetyInfo: "Respect temple movement flows during peak festivals and crowd periods.",
    rules: "Follow temple customs, maintain decorum, and respect restricted ritual zones.",
  },
  {
    id: "fallback-mainpat-hill-station",
    slug: "mainpat-hill-station",
    name: "Mainpat Hill Station",
    district: "Surguja",
    category: "villages",
    description: "A cool plateau landscape with viewpoints, Tibetan settlement areas, and grassland scenery.",
    history: "Known for highland weather, local produce, and a quieter nature-led travel circuit in northern Chhattisgarh.",
    latitude: 22.8417,
    longitude: 83.2768,
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/MAINPAT%2CAMBIKAPUR_CG.jpg/1280px-MAINPAT%2CAMBIKAPUR_CG.jpg",
    bestSeason: "September to February",
    safetyInfo: "Carry layers for changing weather and be cautious on plateau edge roads in fog.",
    rules: "Keep natural viewpoints clean and coordinate with local community operators.",
  },
];

