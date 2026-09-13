import { PrismaClient } from '@prisma/client';

export const PLACES_DATA = [
  {
    name: 'Chitrakote Waterfalls',
    slug: 'chitrakote-waterfalls',
    shortDescription: 'The widest waterfall in India, spanning nearly 300 meters across the Indravati gorge.',
    description: 'Chitrakote Falls is a natural waterfall located to the west of Jagdalpur, in Bastar district in the Indian state of Chhattisgarh on the Indravati River. Often called the Niagara Falls of India due to its horseshoe shape during the monsoon season, it plunges roughly 30 meters into a mist-shrouded pool.',
    districtSlug: 'bastar',
    zoneSlug: 'chitrakote-belt',
    categorySlug: 'waterfall',
    latitude: 19.2024,
    longitude: 81.7067,
    altitudeMeters: 560,
    bestSeason: 'July to October (Monsoon flow) or November to February (Scenic clear waters)',
    heroImage: 'https://images.unsplash.com/photo-1571216332002-282dce467b32?auto=format&fit=crop&w=1600&q=80',
    history: 'The Indravati river descends from the Vindhya ranges into the Dandakaranya forest belt, deeply revered in local tribal Gond mythologies as a sacred cleansing confluence.',
    safetyInfo: 'Strict barricades exist at the cliff edge. Swimming directly beneath the main plunge is prohibited during heavy monsoon surges.',
  },
  {
    name: 'Tirathgarh Waterfalls',
    slug: 'tirathgarh-waterfalls',
    shortDescription: 'A stepped block waterfall cascading in multiple tiers over the Mugabahar River in Kanger Valley.',
    description: 'Tirathgarh Falls is located inside Kanger Valley National Park. The waterfall splits into multiple white cascades over ancient jagged rock layers, dropping a total of over 90 meters surrounded by pristine Sal trees.',
    districtSlug: 'bastar',
    zoneSlug: 'kanger-valley',
    categorySlug: 'waterfall',
    latitude: 18.9172,
    longitude: 81.8644,
    altitudeMeters: 610,
    bestSeason: 'October to March',
    heroImage: 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=1600&q=80',
    history: 'Opposite the falls sits an ancient Shiva and Parvati shrine constructed on a rocky crag, serving as a pilgrimage point for local forest communities.',
    safetyInfo: 'Stone staircases can become slippery with moss during wet periods. Walking shoes with good grip are recommended.',
  },
  {
    name: 'Kutumsar Caves',
    slug: 'kutumsar-caves',
    shortDescription: 'Deep subterranean karst limestone cave system home to unique blind fish and stalactites.',
    description: 'Kutumsar Cave is a subterranean limestone karst cave located near the Kotamsar village in Kanger Valley. Extending over 330 meters into darkness, it features monumental stalactites, stalagmites, and chambers harboring the endemic blind cave fish (Indoreonectes evezardi).',
    districtSlug: 'bastar',
    zoneSlug: 'kanger-valley',
    categorySlug: 'cave',
    latitude: 18.8833,
    longitude: 81.9333,
    altitudeMeters: 580,
    bestSeason: 'November to May (Closed during heavy monsoon due to flooding)',
    heroImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=80',
    history: 'Discovered in the early 20th century and mapped by biospeleologists, the cave holds deep mythological resonance as a dwelling place of the forest spirits.',
    safetyInfo: 'Oxygen levels reduce in the deepest chambers; visitors with respiratory issues should remain in the outer galleries. Guided torchbearers are mandatory.',
  },
  {
    name: 'Sirpur Heritage Complex',
    slug: 'sirpur-heritage-complex',
    shortDescription: 'Major 5th to 8th century archaeological site featuring Buddhist viharas, Shaiva temples, and market corridors.',
    description: 'Sirpur (ancient Shripura) on the banks of the Mahanadi River was the ancient capital of the Somavanshi kings. The complex includes the renowned 7th-century brick Laxman Temple, Anandaprabhu Kuti Vihara, and extensive Buddhist monastic remains visited by Xuanzang in 639 CE.',
    districtSlug: 'mahasamund',
    zoneSlug: 'sirpur-corridor',
    categorySlug: 'heritage',
    latitude: 21.3414,
    longitude: 82.1797,
    altitudeMeters: 270,
    bestSeason: 'November to February',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    history: 'Excavations by the Archaeological Survey of India revealed one of the largest Buddhist and Hindu confluence centers in central India, showcasing bronze casting and monastic scholarship.',
    safetyInfo: 'ASI protected site. Touching or leaning on ancient brick friezes is strictly prohibited.',
  },
  {
    name: 'Bhoramdeo Temple',
    slug: 'bhoramdeo-temple',
    shortDescription: 'The "Khajuraho of Chhattisgarh" constructed in Nagara architectural style in the 11th century.',
    description: 'Bhoramdeo Temple is a complex of medieval Hindu temples dedicated to Lord Shiva, located in the Kabirdham district against the backdrop of the Maikal mountain range. Built between the 7th and 11th centuries by the Nagavanshi kings, its stone outer walls are covered in exquisite erotic and mythological carvings.',
    districtSlug: 'kabirdham',
    zoneSlug: 'bhoramdeo-corridor',
    categorySlug: 'temple',
    latitude: 22.1167,
    longitude: 81.1667,
    altitudeMeters: 420,
    bestSeason: 'October to March',
    heroImage: 'https://images.unsplash.com/photo-1599818967305-b0b2e3c0b020?auto=format&fit=crop&w=1600&q=80',
    history: 'Constructed by King Gopal Dev of the Phani Nagvanshi dynasty, the temple reflects intimate architectural ties with Khajuraho and Konark.',
    safetyInfo: 'Please remove footwear before stepping on the temple mandapa platform.',
  },
  {
    name: 'Mainpat Plateau',
    slug: 'mainpat-plateau',
    shortDescription: 'Rolling forested tableland famous for Tibetan settlements, Jaljali bouncing plains, and Tiger Point.',
    description: 'Mainpat is a serene plateau situated at an elevation of over 1,000 meters in northern Chhattisgarh. Known as "Mini Tibet" due to the Tibetan refugee resettlement established in 1962, it features Dhakpo Shedrupling Monastery, Jaljali bouncing earth, fish point, and roaring mountain streams.',
    districtSlug: 'surguja',
    zoneSlug: 'mainpat-highland',
    categorySlug: 'hill',
    latitude: 22.8167,
    longitude: 83.2833,
    altitudeMeters: 1088,
    bestSeason: 'September to March',
    heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    history: 'Home to traditional Baiga and Yadav communities, Mainpat welcomed Tibetan refugees following the Dalai Lama in 1962, establishing carpet weaving and temple traditions.',
    safetyInfo: 'Mountain roads can have sharp hairpin bends and winter evening fog. Drive with caution.',
  },
  {
    name: 'Barnawapara Wildlife Sanctuary',
    slug: 'barnawapara-wildlife-sanctuary',
    shortDescription: 'Teak and Sal forest sanctuary renowned for leopards, sloth bears, Indian gaur, and birdwatching.',
    description: 'Spread over 245 square kilometers in Baloda Bazar district, Barnawapara is drained by the Balamdehi and Jonk rivers. Its flat terrain and water bodies support rich wildlife populations including chital, sambar, nilgai, wild boar, and over 150 resident bird species.',
    districtSlug: 'baloda-bazar',
    zoneSlug: 'barnawapara-corridor',
    categorySlug: 'wildlife',
    latitude: 21.4011,
    longitude: 82.4172,
    altitudeMeters: 320,
    bestSeason: 'November to May (Best game sightings March-May)',
    heroImage: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1600&q=80',
    history: 'Named after the twin forest villages of Bar and Nawapara, this region was once a dense royal hunting reserve before receiving full wildlife protection in 1976.',
    safetyInfo: 'Open gypsy safaris require registered forest department guides. Never step out of the vehicle inside the forest core.',
  },
  {
    name: 'Achanakmar Tiger Reserve',
    slug: 'achanakmar-tiger-reserve',
    shortDescription: 'Core tiger sanctuary in the central Indian tiger corridor connecting Kanha and Bandhavgarh.',
    description: 'Achanakmar Tiger Reserve in Bilaspur district covers 557 square kilometers of rugged Maikal hill terrain. Home to Bengal tigers, Indian leopards, wild dogs (dhole), and flying squirrels, it forms the core of the UNESCO Achanakmar-Amarkantak Biosphere Reserve.',
    districtSlug: 'bilaspur',
    zoneSlug: 'achanakmar-biosphere',
    categorySlug: 'wildlife',
    latitude: 22.4833,
    longitude: 81.7500,
    altitudeMeters: 650,
    bestSeason: 'November to June',
    heroImage: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1600&q=80',
    history: 'Established as a sanctuary in 1975 and declared a Project Tiger Reserve in 2009, Achanakmar preserves the pristine headwaters of the Narmada and Son rivers.',
    safetyInfo: 'Entry permits required at the barrier checkpost. Night driving through the core zone is strictly regulated.',
  },
];

export async function seedPlaces(prisma: PrismaClient) {
  console.log('🌱 Seeding Authoritative Tourism Places...');
  const districts = await prisma.district.findMany();
  const districtMap = new Map(districts.map((d) => [d.slug, d]));

  const zones = await prisma.touristZone.findMany();
  const zoneMap = new Map(zones.map((z) => [z.slug, z.id]));

  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  const results = [];
  for (const item of PLACES_DATA) {
    const district = districtMap.get(item.districtSlug);
    if (!district) {
      console.warn(`District not found for slug: ${item.districtSlug}`);
      continue;
    }

    const zoneId = zoneMap.get(item.zoneSlug);
    const categoryId = categoryMap.get(item.categorySlug);

    if (!categoryId) {
      console.warn(`Category not found for slug: ${item.categorySlug}`);
      continue;
    }

    const record = await prisma.place.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        shortDescription: item.shortDescription,
        description: item.description,
        latitude: item.latitude,
        longitude: item.longitude,
        altitudeMeters: item.altitudeMeters,
        district: district.name,
        districtRelId: district.id,
        touristZoneId: zoneId || null,
        categoryId,
        bestSeason: item.bestSeason,
        heroImage: item.heroImage,
        history: item.history,
        safetyInfo: item.safetyInfo,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        contentStatus: 'APPROVED',
        verified: true,
        verificationLevel: 'OFFICIAL',
        publishedAt: new Date(),
      },
      create: {
        name: item.name,
        slug: item.slug,
        shortDescription: item.shortDescription,
        description: item.description,
        latitude: item.latitude,
        longitude: item.longitude,
        altitudeMeters: item.altitudeMeters,
        district: district.name,
        districtRelId: district.id,
        touristZoneId: zoneId || null,
        categoryId,
        bestSeason: item.bestSeason,
        heroImage: item.heroImage,
        history: item.history,
        safetyInfo: item.safetyInfo,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        contentStatus: 'APPROVED',
        verified: true,
        verificationLevel: 'OFFICIAL',
        publishedAt: new Date(),
      },
    });

    // Seed primary PlaceCategory join
    await prisma.placeCategory.upsert({
      where: {
        placeId_categoryId: {
          placeId: record.id,
          categoryId,
        },
      },
      update: {},
      create: {
        placeId: record.id,
        categoryId,
      },
    });

    // Seed Safety Profile
    await prisma.safetyProfile.upsert({
      where: { placeId: record.id },
      update: {
        emergencyNotes: item.safetyInfo,
        seasonalWarning: item.bestSeason,
      },
      create: {
        placeId: record.id,
        emergencyNotes: item.safetyInfo,
        seasonalWarning: item.bestSeason,
        accessibility: 'Accessible via regional road network with designated parking.',
      },
    });

    results.push(record);
  }
  return results;
}
