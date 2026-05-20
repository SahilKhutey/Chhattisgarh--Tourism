export interface Destination {
  id: string;
  name: string;
  category: 'waterfalls' | 'forests' | 'temples' | 'villages';
  district?: string;
  tagline: string;
  coordinates: { lat: number; lng: number; mapX: number; mapY: number }; // mapX/Y relative percentage coordinates for a beautiful offline SVG vector map!
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
}

export const DESTINATIONS: Destination[] = [
  {
    id: "chitrakote-falls",
    name: "Chitrakote Waterfalls",
    category: "waterfalls",
    district: "Bastar",
    tagline: "The Majestic 'Niagara of India'",
    coordinates: { lat: 19.2006, lng: 81.6961, mapX: 42, mapY: 78 },
    heroImage: "https://images.unsplash.com/photo-1432405972618-c60002a157c5?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "The Legend of the Indravati Descent",
    story: "According to ancient Bastar folk belief, the Indravati river is a mother goddess descending from the heavens. Chitrakote is where she showcases her supreme cosmic energy (Shakti). Local tribal elders narrate that during the monsoon, the heavy roar of the waterfall represents the celestial drums of Lord Shiva. The mist rising from the gorge is believed to carry the prayers of the forest spirits directly to the heavens.",
    timings: "08:00 AM - 06:00 PM (Everyday)",
    routes: "Located 38 km west of Jagdalpur town. Connect via NH-30 from Raipur. Taxis and regular state transit buses operate daily.",
    bestTime: "July to October (Monsoon flow is jaw-dropping); November to February (Scenic emerald water)",
    seasonalAdvice: "Monsoon offers unparalleled wild grandeur but limits boating in the pool below. Winter offers calm, crystal waters perfect for canyon photography.",
    safety: "Stay strictly within designated security railings. Do not attempt swimming in the base whirlpools under any conditions. Watch for wet, slippery stone structures.",
    nearby: ["Tirathgarh Falls", "Kutumsar Caves", "Bastar Tribal Villages"],
    localInsights: "Visit the local boatmen who belong to the fishing community; they tell secret tales of hidden caves behind the roaring wall of water. Be sure to witness the sunset over the horseshoe gorge from the southern viewpoints.",
    ecoGuidance: "Chhattisgarh state environmental protection rules strictly prohibit carrying plastic water bottles or packages down to the river bank. Bring reusable flasks. Ensure zero litter is left behind to safeguard the pristine aquatic life of the Indravati.",
    biodiversityScore: 92,
    crowdCapacity: 1200,
    rating: 4.9,
    localFood: "Chapotda (Bastar Red Ant Chutney, renowned for its organic tang), Roasted Mahua flowers, and freshly brewed local Salphi nectar.",
    photographySpots: "The Southern Horseshoe Outlook at 5:30 PM (captures golden hour rays piercing the water curtain), and the base boat terminal for high-angle shots."
  },
  {
    id: "sirpur-monuments",
    name: "Sirpur Heritage Complex",
    category: "temples",
    district: "Raipur",
    tagline: "Ancient Crimson Brickwork & Lost Dynasties",
    coordinates: { lat: 21.3414, lng: 82.1764, mapX: 62, mapY: 42 },
    heroImage: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "The Sacred Red Clay Architecture",
    story: "Sirpur, historically known as Shripura, was the ancient capital of Panduvansh kings in the 6th century. The centerpiece, Laxman Temple, stands as one of the finest surviving brick temples in India. Constructed with intricately carved red clay bricks, it was funded by Queen Vasata in memory of her late husband. Archaeological excavations reveal that Sirpur was a major international center for Buddhist, Hindu, and Jain learning, outdating even the famous Nalanda University.",
    timings: "07:00 AM - 06:00 PM (Everyday)",
    routes: "Located 80 km east of Raipur capital. Easily accessible via a well-paved 2-hour drive on National Highway 53.",
    bestTime: "October to March (Mild weather ideal for outdoor archaeological exploration)",
    seasonalAdvice: "Summers in the plains can reach high temperatures; carry wide-brimmed hats and stay hydrated. Winter brings the Sirpur National Dance Festival.",
    safety: "Do not touch or lean on ancient brick friezes and stone carvings. Keep voice levels low inside the hollow main sanctum to preserve its tranquil energy.",
    nearby: ["Barnawapara Sanctuary", "Raipur Museum", "Bhoramdeo Temple"],
    localInsights: "Walk slightly past the main temples to discover the partially excavated underground market complex and assembly halls. The symmetry of these 1400-year-old structures is a marvelous feat of ancient systems design.",
    ecoGuidance: "Sirpur is a protected heritage zone. Do not step on ancient moss/lichen growing on brick foundations. Stay strictly on gravel walkways to prevent foundation erosion.",
    biodiversityScore: 78,
    crowdCapacity: 600,
    rating: 4.8,
    localFood: "Traditional Chila (rice flour crepes) served with sweet tomato-chili chutney, and local green leafy stews (Bhaji).",
    photographySpots: "The front courtyard of Laxman Temple at 07:30 AM (when morning light accentuates the crimson brick carvings perfectly), and the Buddhist Vihara ruins."
  },
  {
    id: "bhoramdeo-temple",
    name: "Bhoramdeo Temple",
    category: "temples",
    district: "Kawardha",
    tagline: "The 'Khajuraho of Chhattisgarh'",
    coordinates: { lat: 22.1158, lng: 81.1542, mapX: 30, mapY: 30 },
    heroImage: "https://images.unsplash.com/photo-1582555172866-1c863b4a2e55?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "The Monolith of the Gond Dynasties",
    story: "Nestled in the lush Maikal Hills, Bhoramdeo was built by King Ramachandra of the Phani Nagvanshi dynasty in the 11th century. Dedicated to Lord Shiva, its design blends Nagara temple style with local tribal Gond symbolism. The temple walls are carved with incredible depictions of mythological deities, warriors, mythical beasts, and sensual carvings. It gets its name from 'Bhoramdeo', an ancient tribal deity of the Gond community who is worshipped here alongside Shiva.",
    timings: "06:00 AM - 08:00 PM",
    routes: "Located 18 km from Kawardha city, and 125 km from Raipur Airport. Connects via highly scenic country lanes.",
    bestTime: "November to March. The sacred Shivratri festival in March brings vibrant local fairs.",
    seasonalAdvice: "Monsoon seasons bring misty rain over the surrounding Maikal hills, creating an incredibly atmospheric, green backdrop around the temple lake.",
    safety: "Monkeys inhabit the temple trees; keep foodstuffs inside zip bags. Maintain respectful attire inside the active inner sanctum.",
    nearby: ["Saroda Reservoir", "Maikal Hills Hiking Trails", "Raipur City"],
    localInsights: "Look for the small statue of the bearded Nagvanshi king carved near the temple's base. It is a rare royal self-portrait preserved in stone.",
    ecoGuidance: "The nearby Bhoramdeo Wildlife Sanctuary is fragile. Respect quiet zones and throw all organic waste only in designated clay bins to prevent disrupting forest fauna.",
    biodiversityScore: 88,
    crowdCapacity: 400,
    rating: 4.7,
    localFood: "Wheat-based Angakar Roti baked slowly between flame-toasted dried cow-dung patties for a deep smoky flavor.",
    photographySpots: "The reflection of the main shikhara (spire) in the tranquil lake waters during early sunrise."
  },
  {
    id: "kanger-valley",
    name: "Kanger Valley National Park",
    category: "forests",
    district: "Bastar",
    tagline: "Pristine Sal Canopies & Subterranean Caves",
    coordinates: { lat: 18.8789, lng: 81.8596, mapX: 48, mapY: 90 },
    heroImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "The Sacred Groves of Bastar",
    story: "Covering 200 sq km of dense, untouched forest, Kanger Valley is one of the most biodiverse zones in central India. It is famous for the Bastar Hill Myna (the official state bird) which can mimic human speech. The park hides ancient geological limestone formations like the Kutumsar Caves. Deep inside these damp, pitch-black chambers live unique blind and transparent fish species, adapted over millions of years of complete isolation.",
    timings: "09:00 AM - 04:00 PM (Closed during monsoons, mid-June to October)",
    routes: "Located 30 km southeast of Jagdalpur. Visitors must register at the park entrance gate and hire an authorized local tribal driver.",
    bestTime: "November to May (Caves are accessible and wildlife spotting is highly active)",
    seasonalAdvice: "Limestone caves fill with subterranean water during the monsoons and are strictly inaccessible. Do not enter without a registered local guide.",
    safety: "Never wander off marked forest trails. Kutumsar Caves have narrow crevices and low oxygen levels deep inside; visitors with breathing conditions should remain in the wider cavern halls.",
    nearby: ["Tirathgarh Waterfalls", "Chitrakote Falls", "Jagdalpur Museum"],
    localInsights: "Listen quietly under the bamboo groves; the local forest rangers can distinguish the calls of rare flying squirrels and Bastar mynas. Hiring a local guide supports the forest economy directly.",
    ecoGuidance: "The caves contain delicate stalactite and stalagmite columns formed over thousands of years. Do not touch them, as oils from human skin permanently halt their crystal growth. Flashlights must be handled with care.",
    biodiversityScore: 97,
    crowdCapacity: 300,
    rating: 4.9,
    localFood: "Bastar Mahua Ladoos, organic honey collected by local tribal cooperative gatherers, and rice-based Pej gruel.",
    photographySpots: "The roots of the giant Sal trees wrapped around rock boulders, and the subterranean limestone amphitheater inside Kutumsar."
  },
  {
    id: "tirathgarh-falls",
    name: "Tirathgarh Waterfalls",
    category: "waterfalls",
    district: "Bastar",
    tagline: "The Milky-White Cascade of Kanger River",
    coordinates: { lat: 18.9161, lng: 81.8654, mapX: 45, mapY: 86 },
    heroImage: "https://images.unsplash.com/photo-1462206634354-94578051759d?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "The White Steps of the Forest Queen",
    story: "Tirathgarh Falls is a block-type waterfall where the Kanger River drops 300 feet in multiple layered steps. The water breaks into countless white streams, giving it a stunning milky appearance, often referred to as 'the forest queen's silk sari.' A small, ancient temple dedicated to Shiva stands on one of the rocky steps of the cascade, where hermits used to meditate amid the roaring water.",
    timings: "08:00 AM - 05:00 PM",
    routes: "35 km from Jagdalpur, situated inside Kanger Valley National Park. Well-maintained forest roads connect to the fall base parking area.",
    bestTime: "September to January (Monsoon runoff transitions to highly detailed, step-wise flows)",
    seasonalAdvice: "In dry summer months, the water decreases significantly. Late monsoon provides the most dramatic, white cascading steps.",
    safety: "Steps leading down are extremely steep and can become slick with moss. Walk slowly and hold the handrails. Do not cross warning signs placed near deep water drop-offs.",
    nearby: ["Kanger Valley Caves", "Danteshwari Temple", "Chitrakote Falls"],
    localInsights: "Descend all the way to the lowest step for a spectacular three-sided panoramic view of the cascading sheets of water. There is a small cave near the base that stays incredibly cool even in hot weather.",
    ecoGuidance: "Avoid carrying disposable plastic packages. The waterfall basin is a critical habitat for unique mountain crabs and fish. Do not discard food crumbs into the water.",
    biodiversityScore: 90,
    crowdCapacity: 800,
    rating: 4.8,
    localFood: "Toasted sweet corn cobs rubbed with local forest limes, and wild berry mixes sold by local tribal women.",
    photographySpots: "The middle staircase viewing deck (captures the tiered steps dropping in a perfect diagonal frame), and the moss-wrapped ancient shrine at the base."
  },
  {
    id: "barnawapara",
    name: "Barnawapara Wildlife Sanctuary",
    category: "forests",
    district: "Raipur",
    tagline: "Lush Teak Forests & Sanctuary of the Indian Bison",
    coordinates: { lat: 21.4012, lng: 82.4208, mapX: 68, mapY: 48 },
    heroImage: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "The Refuge of Valmiki and Forest Gods",
    story: "Covering 244 sq km of deciduous forests, Barnawapara is named after twin forest villages: Bar and Nawa Para. Local folklore integrates this forest with the epic Ramayana; it is believed that Sage Valmiki's ashram was located here, where Luv and Kush were born. Today, it is a crucial conservation zone for the Gaur (Indian Bison), Leopards, Sloth Bears, and over 150 species of vibrant tropical birds.",
    timings: "06:00 AM - 10:30 AM & 03:00 PM - 06:00 PM (Closed from 1st July to 31st October)",
    routes: "100 km from Raipur city. Take national highway 53 to Pithora, then connect to the sanctuary entry gate via forest lanes.",
    bestTime: "November to April (Optimal foliage for mammal spotting and migratory birds)",
    seasonalAdvice: "Open gypsy safaris operate during dry months. Wear neutral, earthy colors (khaki, olive, tan) to blend into the dry deciduous teak landscape.",
    safety: "Do not wear bright colors (red, white) during safaris. Remain strictly inside the safari vehicle. Never try to feed or call out to wild animals.",
    nearby: ["Sirpur Monuments", "Raipur City", "Saroda Reservoir"],
    localInsights: "Request your local jeep driver to halt near the Devdhara waterfall basin inside the park. It is a tranquil forest pool where wildlife regularly gathers for water during early afternoon heat.",
    ecoGuidance: "Strict zero-noise policy inside the sanctuary boundary. Keep mobile devices on silent. Avoid flash photography as it can disorient and agitate nocturnal sloth bears.",
    biodiversityScore: 94,
    crowdCapacity: 400,
    rating: 4.6,
    localFood: "Forest-gathered gooseberry (Amla) preserves, local hand-pounded red rice flakes (Poha), and organic herbal forest tea.",
    photographySpots: "The watchtower overlooking the main salt lick watering hole at 06:30 AM (often catches groups of wild bisons emerging from the forest mist)."
  },
  {
    id: "achanakmar",
    name: "Achanakmar Tiger Reserve",
    category: "forests",
    district: "Bilaspur",
    tagline: "Lost in the Sal-Teak Heartland of Central India",
    coordinates: { lat: 22.5300, lng: 81.8800, mapX: 55, mapY: 22 },
    heroImage: "https://images.unsplash.com/photo-1589656966895-2f331719b5d9?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "The Last Bastion of the Central Indian Tiger",
    story: "Achanakmar Tiger Reserve sprawls across the Maikal Hills, a forgotten highland corridor linking Kanha and Pench tiger reserves. Ancient tribal communities have coexisted with the forest's tigers for centuries, developing sacred groves ('Dev Vans') where no trees are ever felled. Local oral tradition holds that the spirit of the forest tiger is the guardian of the tribal boundary — its roar signals both danger and protection.",
    timings: "06:00 AM - 10:00 AM & 03:00 PM - 05:30 PM",
    routes: "Located 175 km from Bilaspur city. Take NH-130C and enter at the Lamni gate. Prior online booking is mandatory.",
    bestTime: "November to March (Peak wildlife activity and dry-season water pooling)",
    seasonalAdvice: "Reserve is closed from July to October during monsoons. Temperature drops significantly in winter — carry warm layers for dawn safaris.",
    safety: "Stay inside safari vehicles at all times. Do not use flash photography near wildlife. Maintain strict silence near waterholes and salt licks.",
    nearby: ["Khutaghat Dam", "Amarkantak Pilgrimage", "Bilaspur City"],
    localInsights: "Ask your guide to visit the ancient Dhouda waterfall inside the reserve — it is rarely shown to tourists and provides spectacular opportunities to spot sambar deer.",
    ecoGuidance: "Achanakmar is a UNESCO-recognised biosphere reserve. Carry zero plastic. All biodegradable waste must be packed out. Leave only footprints.",
    biodiversityScore: 96,
    crowdCapacity: 250,
    rating: 4.8,
    localFood: "Tribal honey-glazed forest bamboo shoots, and wild gooseberry chutneys from local forest cooperative stalls at the reserve gate.",
    photographySpots: "The elevated machan watchtower overlooking the main meadow at 06:30 AM for spectacular tiger pugmark tracking and spotted deer groupings."
  },
  {
    id: "gangrel-dam",
    name: "Gangrel Dam & Reservoir",
    category: "waterfalls",
    district: "Durg",
    tagline: "The Largest Reservoir of Chhattisgarh",
    coordinates: { lat: 20.6667, lng: 81.4833, mapX: 38, mapY: 60 },
    heroImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4e0f11?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "The Man-Made Sea of Chhattisgarh",
    story: "Built across the Mahanadi River, the Gangrel (Ravishankar Sagar) Dam is the largest reservoir in Chhattisgarh. It is the birthplace of the Mahanadi water story — this colossal water body feeds the plains of Odisha and sustains 40% of the state's agriculture. During the monsoon overflow discharge, the dam's spillway thunder can be heard from 5 km away, as 36 gates open simultaneously in a breathtaking water spectacle.",
    timings: "06:00 AM - 07:00 PM (Garden and viewpoint; dam structure restricted)",
    routes: "Located 35 km from Dhamtari and 80 km from Raipur. Well-paved highway connectivity via SH-4.",
    bestTime: "August to November (Monsoon overflow discharge is spectacular)",
    seasonalAdvice: "Overflow discharge season (August-September) provides the best visual experience but expect large weekend crowds. Winters are peaceful and excellent for birdwatching.",
    safety: "Do not cross safety barriers near the spillway. Strong undertow currents exist near the dam base. Children must be supervised near water edges at all times.",
    nearby: ["Dhamtari City", "Sihawa Sacred Hills", "Raipur Airport"],
    localInsights: "Visit the Garden of Eden park built on the reservoir shore for sunset views over the glittering water. Local fishermen sell fresh Rohu catches right on the dam road at dawn.",
    ecoGuidance: "The reservoir is a Ramsar-nominated migratory bird habitat. Do not litter or discharge cleaning agents near the water. Avoid disturbing waterfowl colonies on the southern shore islands.",
    biodiversityScore: 82,
    crowdCapacity: 1500,
    rating: 4.4,
    localFood: "Fresh Mahanadi Rohu fish curried in local turmeric-mustard gravy, and sweet rice Kheer from dam-side dhabas.",
    photographySpots: "The main dam walkway at overflow discharge (36 gates open) captures a once-a-year spectacle, and the southern bird sanctuary shore at sunrise."
  }
];

export function getDestinationById(id: string): Destination | undefined {
  return DESTINATIONS.find(d => d.id === id);
}
