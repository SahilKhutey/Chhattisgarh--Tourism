import { PrismaClient } from '@prisma/client';

export const EXPERIENCES_DATA = [
  {
    placeSlug: 'chitrakote-waterfalls',
    title: 'Traditional Wooden Boat Ride Under Chitrakote Spray',
    slug: 'chitrakote-boat-ride',
    description: 'Local tribal boatmen navigate traditional wooden boats into the misty pool at the base of the roaring cascade.',
    durationMin: 45,
    difficulty: 'EASY' as const,
  },
  {
    placeSlug: 'kutumsar-caves',
    title: 'Guided Speleology Exploration into Limestone Chambers',
    slug: 'kutumsar-speleology-exploration',
    description: 'Venture with experienced local forest guides holding kerosene lanterns through subterranean karst limestone galleries.',
    durationMin: 90,
    difficulty: 'MODERATE' as const,
  },
  {
    placeSlug: 'sirpur-heritage-complex',
    title: 'Sirpur Buddhist Vihara & Monastic Walking Tour',
    slug: 'sirpur-monastic-walking-tour',
    description: 'Guided architectural walk visiting the 7th-century Laxman temple brick friezes and Anandaprabhu Vihara underground chambers.',
    durationMin: 120,
    difficulty: 'EASY' as const,
  },
  {
    placeSlug: 'mainpat-plateau',
    title: 'Jaljali Bouncing Earth Walk & Tibetan Monastery Circuit',
    slug: 'mainpat-jaljali-monastery-circuit',
    description: 'Experience the unique seismic-spongy marshland at Jaljali followed by evening butter-lamp prayers at Dhakpo Shedrupling Monastery.',
    durationMin: 150,
    difficulty: 'EASY' as const,
  },
  {
    placeSlug: 'bhoramdeo-temple',
    title: 'Bhoramdeo Sunrise Temple & Maikal Hills Heritage Trail',
    slug: 'bhoramdeo-sunrise-trail',
    description: 'Morning circumambulation of the 11th-century Phani Nagvanshi temple followed by an easy nature walk along Sakri river.',
    durationMin: 90,
    difficulty: 'EASY' as const,
  },
];

export async function seedExperiences(prisma: PrismaClient) {
  console.log('🌱 Seeding Tourism Experiences...');
  const results = [];
  for (const exp of EXPERIENCES_DATA) {
    const place = await prisma.place.findUnique({
      where: { slug: exp.placeSlug },
    });

    if (!place) {
      console.warn(`Place not found for experience: ${exp.placeSlug}`);
      continue;
    }

    const record = await prisma.experience.upsert({
      where: { slug: exp.slug },
      update: {
        title: exp.title,
        description: exp.description,
        durationMin: exp.durationMin,
        difficulty: exp.difficulty,
        placeId: place.id,
        isActive: true,
      },
      create: {
        title: exp.title,
        slug: exp.slug,
        description: exp.description,
        durationMin: exp.durationMin,
        difficulty: exp.difficulty,
        placeId: place.id,
        isActive: true,
      },
    });
    results.push(record);
  }
  return results;
}
