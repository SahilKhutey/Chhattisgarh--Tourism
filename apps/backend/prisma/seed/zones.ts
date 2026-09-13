import { PrismaClient } from '@prisma/client';

export const ZONES_DATA = [
  {
    name: 'Bastar Plateau',
    slug: 'bastar-plateau',
    districtSlug: 'bastar',
    description: 'Undulating Sal forest plateau featuring rich tribal cultures, weekly haats, and prehistoric rock art.',
    lat: 19.0730,
    lng: 82.0238,
  },
  {
    name: 'Kanger Valley',
    slug: 'kanger-valley',
    districtSlug: 'bastar',
    description: 'Dense tropical biosphere featuring subterranean karst limestone caves and Tirathgarh cascade.',
    lat: 18.9172,
    lng: 81.8644,
  },
  {
    name: 'Chitrakote Belt',
    slug: 'chitrakote-belt',
    districtSlug: 'bastar',
    description: 'The Indravati river gorge corridor housing the horseshoe Niagara of India.',
    lat: 19.2024,
    lng: 81.7067,
  },
  {
    name: 'Sirpur Buddhist Corridor',
    slug: 'sirpur-corridor',
    districtSlug: 'mahasamund',
    description: 'Ancient 5th–8th century Buddhist viharas, monasteries, and Laxman temple on the banks of Mahanadi.',
    lat: 21.3414,
    lng: 82.1797,
  },
  {
    name: 'Mainpat Highland Tableland',
    slug: 'mainpat-highland',
    districtSlug: 'surguja',
    description: 'The "Shimla of Chhattisgarh" featuring Tibetan settlements, Jaljali bouncing earth, and waterfalls.',
    lat: 22.8167,
    lng: 83.2833,
  },
  {
    name: 'Barnawapara Eco Corridor',
    slug: 'barnawapara-corridor',
    districtSlug: 'baloda-bazar',
    description: 'Teak and bamboo sanctuary teeming with leopards, flying squirrels, and four-horned antelopes.',
    lat: 21.4011,
    lng: 82.4172,
  },
  {
    name: 'Bhoramdeo Heritage Corridor',
    slug: 'bhoramdeo-corridor',
    districtSlug: 'kabirdham',
    description: 'Nagara-style 11th century Khajuraho of Chhattisgarh nestled within Maikal hills range.',
    lat: 22.1167,
    lng: 81.1667,
  },
  {
    name: 'Achanakmar Biosphere Reserve',
    slug: 'achanakmar-biosphere',
    districtSlug: 'bilaspur',
    description: 'Part of the Amarkantak Biosphere Reserve connecting central Indian tiger corridors.',
    lat: 22.4833,
    lng: 81.7500,
  },
];

export async function seedZones(prisma: PrismaClient) {
  console.log('🌱 Seeding Key Tourism Zones...');
  const districts = await prisma.district.findMany();
  const districtMap = new Map(districts.map((d) => [d.slug, d.id]));

  const results = [];
  for (const item of ZONES_DATA) {
    const districtId = districtMap.get(item.districtSlug);
    if (!districtId) {
      console.warn(`District not found for slug: ${item.districtSlug}`);
      continue;
    }

    const record = await prisma.touristZone.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        latitude: item.lat,
        longitude: item.lng,
        districtId,
      },
      create: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        latitude: item.lat,
        longitude: item.lng,
        districtId,
        status: 'ACTIVE',
      },
    });
    results.push(record);
  }
  return results;
}
