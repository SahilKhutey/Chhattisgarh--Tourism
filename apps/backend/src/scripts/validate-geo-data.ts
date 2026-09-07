import { PrismaClient } from '@prisma/client';
import { BoundaryService } from '../geo/services/boundary.service';

const prisma = new PrismaClient();
const boundaryService = new BoundaryService();

async function main() {
  console.log('🔍 Starting CG Tourism Geospatial & Boundary Validation Audit...');

  const places = await prisma.place.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      latitude: true,
      longitude: true,
      district: true,
    },
  });

  let invalidCoords = 0;
  let outsideCG = 0;
  let validCount = 0;

  for (const place of places) {
    const lat = Number(place.latitude);
    const lng = Number(place.longitude);

    const validNumbers =
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180;

    if (!validNumbers) {
      invalidCoords++;
      console.error(`❌ [INVALID COORDS] ${place.id} "${place.name}": (${lat}, ${lng})`);
      continue;
    }

    const insideState = boundaryService.isInsideChhattisgarh(lat, lng);
    if (!insideState) {
      outsideCG++;
      console.warn(`⚠️  [OUTSIDE STATE] ${place.id} "${place.name}": (${lat}, ${lng}) district: ${place.district}`);
      continue;
    }

    validCount++;
  }

  console.log('\n============================================================');
  console.log('📊 Geospatial Validation Audit Summary:');
  console.log(`   Total Places Analyzed : ${places.length}`);
  console.log(`   Valid & In-Bounds     : ${validCount}`);
  console.log(`   Outside State Envelope: ${outsideCG}`);
  console.log(`   Invalid Coordinates   : ${invalidCoords}`);
  console.log('============================================================\n');

  if (invalidCoords > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error('Fatal error during validation:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
