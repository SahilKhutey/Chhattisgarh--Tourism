import { PrismaClient } from '@prisma/client';

export const CATEGORIES_DATA = [
  {
    name: 'Waterfalls & Cascades',
    slug: 'waterfall',
    description: 'Thundering monsoon waterfalls and forest cascades across Bastar and Surguja.',
    icon: 'waterfall',
  },
  {
    name: 'Temples & Spiritual Sanctuaries',
    slug: 'temple',
    description: 'Ancient Shaivite, Shakti peethas, and sacred tribal shrines.',
    icon: 'landmark',
  },
  {
    name: 'Wildlife & National Parks',
    slug: 'wildlife',
    description: 'Tiger reserves, wild buffalo habitats, and pristine bio-reserves.',
    icon: 'trees',
  },
  {
    name: 'Nature & Landscapes',
    slug: 'nature',
    description: 'Dense Sal forests, rolling plateau valleys, and tranquil river corridors.',
    icon: 'mountain',
  },
  {
    name: 'Heritage & Archaeology',
    slug: 'heritage',
    description: 'Ancient Buddhist viharas, royal forts, and prehistoric rock art.',
    icon: 'shield',
  },
  {
    name: 'Caves & Karst Formations',
    slug: 'cave',
    description: 'Subterranean limestone karst caves with stalactites and blind aquatic life.',
    icon: 'compass',
  },
  {
    name: 'Hills & Tablelands',
    slug: 'hill',
    description: 'Scenic tablelands, mist-covered lookouts, and trekking ridges.',
    icon: 'sun',
  },
  {
    name: 'Tribal Craft & Living Culture',
    slug: 'craft',
    description: 'Dhokra lost-wax brass, Bell Metal, Kosa silk, and weekly rural haats.',
    icon: 'palette',
  },
];

export async function seedCategories(prisma: PrismaClient) {
  console.log('🌱 Seeding Canonical Tourism Categories...');
  const results = [];
  for (const cat of CATEGORIES_DATA) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        isActive: true,
      },
    });
    results.push(record);
  }
  return results;
}
