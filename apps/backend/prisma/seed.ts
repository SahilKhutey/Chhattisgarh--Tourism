import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_DESTINATIONS = [
  {
    slug: "chitrakote-falls",
    name: "Chitrakote Waterfalls",
    categorySlug: "waterfalls",
    district: "Bastar",
    tagline: "The Majestic 'Niagara of India'",
    latitude: 19.2006,
    longitude: 81.6961,
    heroImage: "https://images.unsplash.com/photo-1432405972618-c60002a157c5?auto=format&fit=crop&w=1200&q=80",
    story: "According to ancient Bastar folk belief, the Indravati river is a mother goddess descending from the heavens. Chitrakote is where she showcases her supreme cosmic energy (Shakti). Local tribal elders narrate that during the monsoon, the heavy roar of the waterfall represents the celestial drums of Lord Shiva. The mist rising from the gorge is believed to carry the prayers of the forest spirits directly to the heavens.",
    bestTime: "July to October (Monsoon flow is jaw-dropping); November to February (Scenic emerald water)",
    safety: "Stay strictly within designated security railings. Do not attempt swimming in the base whirlpools under any conditions. Watch for wet, slippery stone structures.",
    ecoGuidance: "Chhattisgarh state environmental protection rules strictly prohibit carrying plastic water bottles or packages down to the river bank. Bring reusable flasks. Ensure zero litter is left behind to safeguard the pristine aquatic life of the Indravati."
  },
  {
    slug: "sirpur-monuments",
    name: "Sirpur Heritage Complex",
    categorySlug: "temples",
    district: "Raipur",
    tagline: "Ancient Crimson Brickwork & Lost Dynasties",
    latitude: 21.3414,
    longitude: 82.1764,
    heroImage: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80",
    story: "Sirpur, historically known as Shripura, was the ancient capital of Panduvansh kings in the 6th century. The centerpiece, Laxman Temple, stands as one of the finest surviving brick temples in India. Constructed with intricately carved red clay bricks, it was funded by Queen Vasata in memory of her late husband. Archaeological excavations reveal that Sirpur was a major international center for Buddhist, Hindu, and Jain learning, outdating even the famous Nalanda University.",
    bestTime: "October to March (Mild weather ideal for outdoor archaeological exploration)",
    safety: "Do not touch or lean on ancient brick friezes and stone carvings. Keep voice levels low inside the hollow main sanctum to preserve its tranquil energy.",
    ecoGuidance: "Sirpur is a protected heritage zone. Do not step on ancient moss/lichen growing on brick foundations. Stay strictly on gravel walkways to prevent foundation erosion."
  },
  {
    slug: "bhoramdeo-temple",
    name: "Bhoramdeo Temple",
    categorySlug: "temples",
    district: "Kawardha",
    tagline: "The 'Khajuraho of Chhattisgarh'",
    latitude: 22.1158,
    longitude: 81.1542,
    heroImage: "https://images.unsplash.com/photo-1582555172866-1c863b4a2e55?auto=format&fit=crop&w=1200&q=80",
    story: "Nestled in the lush Maikal Hills, Bhoramdeo was built by King Ramachandra of the Phani Nagvanshi dynasty in the 11th century. Dedicated to Lord Shiva, its design blends Nagara temple style with local tribal Gond symbolism. The temple walls are carved with incredible depictions of mythological deities, warriors, mythical beasts, and sensual carvings. It gets its name from 'Bhoramdeo', an ancient tribal deity of the Gond community who is worshipped here alongside Shiva.",
    bestTime: "November to March. The sacred Shivratri festival in March brings vibrant local fairs.",
    safety: "Monkeys inhabit the temple trees; keep foodstuffs inside zip bags. Maintain respectful attire inside the active inner sanctum.",
    ecoGuidance: "The nearby Bhoramdeo Wildlife Sanctuary is fragile. Respect quiet zones and throw all organic waste only in designated clay bins to prevent disrupting forest fauna."
  },
  {
    slug: "kanger-valley",
    name: "Kanger Valley National Park",
    categorySlug: "forests",
    district: "Bastar",
    tagline: "Pristine Sal Canopies & Subterranean Caves",
    latitude: 18.8789,
    longitude: 81.8596,
    heroImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    story: "Covering 200 sq km of dense, untouched forest, Kanger Valley is one of the most biodiverse zones in central India. It is famous for the Bastar Hill Myna (the official state bird) which can mimic human speech. The park hides ancient geological limestone formations like the Kutumsar Caves. Deep inside these damp, pitch-black chambers live unique blind and transparent fish species, adapted over millions of years of complete isolation.",
    bestTime: "November to May (Caves are accessible and wildlife spotting is highly active)",
    safety: "Never wander off marked forest trails. Kutumsar Caves have narrow crevices and low oxygen levels deep inside; visitors with breathing conditions should remain in the wider cavern halls.",
    ecoGuidance: "The caves contain delicate stalactite and stalagmite columns formed over thousands of years. Do not touch them, as oils from human skin permanently halt their crystal growth. Flashlights must be handled with care."
  },
  {
    slug: "tirathgarh-falls",
    name: "Tirathgarh Waterfalls",
    categorySlug: "waterfalls",
    district: "Bastar",
    tagline: "The Milky-White Cascade of Kanger River",
    latitude: 18.9161,
    longitude: 81.8654,
    heroImage: "https://images.unsplash.com/photo-1462206634354-94578051759d?auto=format&fit=crop&w=1200&q=80",
    story: "Tirathgarh Falls is a block-type waterfall where the Kanger River drops 300 feet in multiple layered steps. The water breaks into countless white streams, giving it a stunning milky appearance, often referred to as 'the forest queen's silk sari.' A small, ancient temple dedicated to Shiva stands on one of the rocky steps of the cascade, where hermits used to meditate amid the roaring water.",
    bestTime: "September to January (Monsoon runoff transitions to highly detailed, step-wise flows)",
    safety: "Steps leading down are extremely steep and can become slick with moss. Walk slowly and hold the handrails. Do not cross warning signs placed near deep water drop-offs.",
    ecoGuidance: "Avoid carrying disposable plastic packages. The waterfall basin is a critical habitat for unique mountain crabs and fish. Do not discard food crumbs into the water."
  },
  {
    slug: "barnawapara",
    name: "Barnawapara Wildlife Sanctuary",
    categorySlug: "forests",
    district: "Raipur",
    tagline: "Lush Teak Forests & Sanctuary of the Indian Bison",
    latitude: 21.4012,
    longitude: 82.4208,
    heroImage: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80",
    story: "Covering 244 sq km of deciduous forests, Barnawapara is named after twin forest villages: Bar and Nawa Para. Local folklore integrates this forest with the epic Ramayana; it is believed that Sage Valmiki's ashram was located here, where Luv and Kush were born. Today, it is a crucial conservation zone for the Gaur (Indian Bison), Leopards, Sloth Bears, and over 150 species of vibrant tropical birds.",
    bestTime: "November to April (Optimal foliage for mammal spotting and migratory birds)",
    safety: "Do not wear bright colors (red, white) during safaris. Remain strictly inside the safari vehicle. Never try to feed or call out to wild animals.",
    ecoGuidance: "Strict zero-noise policy inside the sanctuary boundary. Keep mobile devices on silent. Avoid flash photography as it can disorient and agitate nocturnal sloth bears."
  },
  {
    slug: "achanakmar",
    name: "Achanakmar Tiger Reserve",
    categorySlug: "forests",
    district: "Bilaspur",
    tagline: "Lost in the Sal-Teak Heartland of Central India",
    latitude: 22.5300,
    longitude: 81.8800,
    heroImage: "https://images.unsplash.com/photo-1589656966895-2f331719b5d9?auto=format&fit=crop&w=1200&q=80",
    story: "Achanakmar Tiger Reserve sprawls across the Maikal Hills, a forgotten highland corridor linking Kanha and Pench tiger reserves. Ancient tribal communities have coexisted with the forest's tigers for centuries, developing sacred groves ('Dev Vans') where no trees are ever felled. Local oral tradition holds that the spirit of the forest tiger is the guardian of the tribal boundary — its roar signals both danger and protection.",
    bestTime: "November to March (Peak wildlife activity and dry-season water pooling)",
    safety: "Stay inside safari vehicles at all times. Do not use flash photography near wildlife. Maintain strict silence near waterholes and salt licks.",
    ecoGuidance: "Achanakmar is a UNESCO-recognised biosphere reserve. Carry zero plastic. All biodegradable waste must be packed out. Leave only footprints."
  },
  {
    slug: "gangrel-dam",
    name: "Gangrel Dam & Reservoir",
    categorySlug: "waterfalls",
    district: "Dhamtari",
    tagline: "The Largest Reservoir of Chhattisgarh",
    latitude: 20.6667,
    longitude: 81.4833,
    heroImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4e0f11?auto=format&fit=crop&w=1200&q=80",
    story: "Built across the Mahanadi River, the Gangrel (Ravishankar Sagar) Dam is the largest reservoir in Chhattisgarh. It is the birthplace of the Mahanadi water story — this colossal water body feeds the plains of Odisha and sustains 40% of the state's agriculture. During the monsoon overflow discharge, the dam's spillway thunder can be heard from 5 km away, as 36 gates open simultaneously in a breathtaking water spectacle.",
    bestTime: "August to November (Monsoon overflow discharge is spectacular)",
    safety: "Do not cross safety barriers near the spillway. Strong undertow currents exist near the dam base. Children must be supervised near water edges at all times.",
    ecoGuidance: "The reservoir is a Ramsar-nominated migratory bird habitat. Do not litter or discharge cleaning agents near the water. Avoid disturbing waterfowl colonies on the southern shore islands."
  }
];

const SEED_CATEGORIES = [
  { name: "Waterfalls", slug: "waterfalls" },
  { name: "Forests & Parks", slug: "forests" },
  { name: "Historic Temples", slug: "temples" },
  { name: "Tribal Villages", slug: "villages" }
];

async function main() {
  console.log('Starting seed operations for CG Tourism database...');

  // 1. Clear existing records to ensure clean slate transitions
  await prisma.bookmark.deleteMany();
  await prisma.review.deleteMany();
  await prisma.media.deleteMany();
  await prisma.place.deleteMany();
  await prisma.category.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleaned database tables successfully.');

  // 2. Create User Accounts
  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('SuperSecureAdminPassword2026!', saltRounds);
  const creatorPasswordHash = await bcrypt.hash('SuperSecureCreatorPassword2026!', saltRounds);

  const adminUser = await prisma.user.create({
    data: {
      fullName: 'Chhattisgarh Tourism Administrator',
      email: 'admin@cgtourism.gov.in',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const creatorUser = await prisma.user.create({
    data: {
      fullName: 'Aarav Mandavi',
      email: 'aarav.creator@cgtourism.org',
      password: creatorPasswordHash,
      role: 'CREATOR',
    },
  });

  // 3. Create Creator Profile
  await prisma.creatorProfile.create({
    data: {
      userId: creatorUser.id,
      verified: true,
      bio: 'Bastar-based explorer and folklore preservation volunteer.',
      instagram: 'aarav_bastar_explore',
      youtube: 'BastarWanderer',
    },
  });

  console.log('Created basic User and Creator profiles.');

  // 4. Create Travel Categories and build mapping cache
  const categoryCache: { [slug: string]: string } = {};
  for (const cat of SEED_CATEGORIES) {
    const createdCat = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug }
    });
    categoryCache[cat.slug] = createdCat.id;
  }
  console.log('Populated travel categories successfully.');

  // 5. Populate Landmark Destinations
  for (const destination of SEED_DESTINATIONS) {
    const categoryId = categoryCache[destination.categorySlug];
    if (!categoryId) {
      console.warn(`Category mapping failed for category slug: ${destination.categorySlug}`);
      continue;
    }

    const createdPlace = await prisma.place.create({
      data: {
        slug: destination.slug,
        name: destination.name,
        description: destination.tagline,
        district: destination.district,
        categoryId: categoryId,
        latitude: destination.latitude,
        longitude: destination.longitude,
        heroImage: destination.heroImage,
        bestSeason: destination.bestTime,
        history: destination.story,
        safetyInfo: destination.safety,
        rules: destination.ecoGuidance,
        verified: true,
      }
    });

    // Seed initial media mapping
    await prisma.media.create({
      data: {
        url: destination.heroImage,
        type: 'IMAGE',
        placeId: createdPlace.id,
      }
    });

    // Seed mock reviews for first few items
    if (destination.slug === 'chitrakote-falls') {
      await prisma.review.create({
        data: {
          rating: 5,
          comment: 'Absolutely breathtaking! The roar of Chitrakote during late August is a spiritual experience.',
          userId: creatorUser.id,
          placeId: createdPlace.id,
        }
      });
    }
  }

  console.log('Seeded all 8 landmark destinations successfully.');
  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Error occurred during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
