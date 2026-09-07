import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Starting Itinerary Planning Data Validation Audit...');

  const places = await prisma.place.findMany({
    where: {
      verified: true,
    },
    include: {
      planningProfile: true,
    },
  });

  let failures = 0;

  for (const place of places) {
    if (!place.planningProfile) {
      console.error(`[P8] Missing planning profile: ${place.slug}`);
      failures++;
      continue;
    }

    if (place.planningProfile.visitorCapacity === null) {
      console.error(`[P8] Missing visitor capacity: ${place.slug}`);
      failures++;
    }

    if (place.planningProfile.estimatedVisitMinutes <= 0) {
      console.error(`[P8] Invalid visit duration: ${place.slug}`);
      failures++;
    }

    if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) {
      console.error(`[P8] Invalid coordinates: ${place.slug}`);
      failures++;
    }
  }

  console.log(`[P8] Verified places checked : ${places.length}`);
  console.log(`[P8] Validation failures     : ${failures}`);

  if (failures > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error('[P8] Data validation failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
