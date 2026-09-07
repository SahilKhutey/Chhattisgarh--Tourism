import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type PlanningProfile = {
  slug: string;
  visitorCapacity: number;
  estimatedVisitMinutes: number;
  planningEnabled?: boolean;
  seasonalAvailability?: string;
  planningNotes?: string;
};

const curatedProfiles: PlanningProfile[] = [
  {
    slug: 'chitrakote-falls',
    visitorCapacity: 500,
    estimatedVisitMinutes: 120,
    planningEnabled: true,
    seasonalAvailability: 'Year-round; conditions vary seasonally',
    planningNotes: 'Validate local access and safety conditions before publication.',
  },
  {
    slug: 'teerathgarh-falls',
    visitorCapacity: 300,
    estimatedVisitMinutes: 120,
    planningEnabled: true,
    seasonalAvailability: 'Seasonal conditions apply',
    planningNotes: 'Follow local safety instructions.',
  },
  {
    slug: 'kanger-valley',
    visitorCapacity: 250,
    estimatedVisitMinutes: 180,
    planningEnabled: true,
    seasonalAvailability: 'Access subject to park conditions',
    planningNotes: 'Park access and restrictions must be verified before publishing.',
  },
  {
    slug: 'sirpur-heritage-site',
    visitorCapacity: 400,
    estimatedVisitMinutes: 150,
    planningEnabled: true,
    seasonalAvailability: 'October to March ideal',
    planningNotes: 'Archaeological site; guide recommended.',
  },
  {
    slug: 'bhoramdeo-temple',
    visitorCapacity: 350,
    estimatedVisitMinutes: 90,
    planningEnabled: true,
    seasonalAvailability: 'Year-round',
    planningNotes: 'Respect sacred temple premises.',
  },
  {
    slug: 'mainpat-tiger-point',
    visitorCapacity: 300,
    estimatedVisitMinutes: 120,
    planningEnabled: true,
    seasonalAvailability: 'Monsoon and Winter',
    planningNotes: 'Misty conditions during peak winter.',
  },
  {
    slug: 'barnawapara-wildlife-sanctuary',
    visitorCapacity: 200,
    estimatedVisitMinutes: 240,
    planningEnabled: true,
    seasonalAvailability: 'November to June',
    planningNotes: 'Forest entry permit required.',
  },
  {
    slug: 'danteshwari-temple',
    visitorCapacity: 600,
    estimatedVisitMinutes: 60,
    planningEnabled: true,
    seasonalAvailability: 'Year-round; special during Navratri/Bastar Dussehra',
    planningNotes: 'Modest dress code required.',
  },
];

async function main() {
  console.log('🌱 Seeding PlacePlanningProfiles for verified destinations...');

  // 1. Apply curated profiles
  for (const profile of curatedProfiles) {
    const place = await prisma.place.findFirst({
      where: {
        OR: [{ slug: profile.slug }, { slug: { contains: profile.slug.split('-')[0] } }],
      },
      select: { id: true, slug: true, name: true },
    });

    if (!place) {
      continue;
    }

    await prisma.placePlanningProfile.upsert({
      where: { placeId: place.id },
      update: {
        visitorCapacity: profile.visitorCapacity,
        estimatedVisitMinutes: profile.estimatedVisitMinutes,
        planningEnabled: profile.planningEnabled ?? true,
        seasonalAvailability: profile.seasonalAvailability,
        planningNotes: profile.planningNotes,
      },
      create: {
        placeId: place.id,
        visitorCapacity: profile.visitorCapacity,
        estimatedVisitMinutes: profile.estimatedVisitMinutes,
        planningEnabled: profile.planningEnabled ?? true,
        seasonalAvailability: profile.seasonalAvailability,
        planningNotes: profile.planningNotes,
      },
    });

    console.log(`[P8] Planning profile updated for: ${place.name} (${place.slug})`);
  }

  // 2. Backfill default planning profile for any verified place that does not have one
  const allVerified = await prisma.place.findMany({
    where: {
      verified: true,
      planningProfile: null,
    },
    select: { id: true, name: true, slug: true, category: { select: { name: true } } },
  });

  for (const place of allVerified) {
    const catName = place.category?.name?.toLowerCase() ?? '';
    let visitMins = 90;
    let capacity = 300;

    if (catName.includes('waterfall')) {
      visitMins = 120;
      capacity = 400;
    } else if (catName.includes('forest') || catName.includes('wildlife')) {
      visitMins = 180;
      capacity = 250;
    } else if (catName.includes('temple')) {
      visitMins = 60;
      capacity = 500;
    }

    await prisma.placePlanningProfile.create({
      data: {
        placeId: place.id,
        visitorCapacity: capacity,
        estimatedVisitMinutes: visitMins,
        planningEnabled: true,
        seasonalAvailability: 'Year-round',
        planningNotes: 'Standard regional tourism safety guidelines apply.',
      },
    });

    console.log(`[P8] Default planning profile attached: ${place.name}`);
  }

  console.log('✅ PlacePlanningProfile seeding completed.');
}

main()
  .catch((error) => {
    console.error('[P8] Planning profile seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
