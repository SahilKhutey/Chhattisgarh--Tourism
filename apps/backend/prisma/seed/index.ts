import { PrismaClient } from '@prisma/client';
import { seedDivisions } from './divisions';
import { seedDistricts } from './districts';
import { seedZones } from './zones';
import { seedCategories } from './categories';
import { seedPlaces } from './places';
import { seedExperiences } from './experiences';
import { seedServices } from './services';

export async function runCanonicalSeed(client?: PrismaClient) {
  const prisma = client ?? new PrismaClient();
  const shouldDisconnect = !client;

  console.log('════════════════════════════════════════════════════════════════');
  console.log('🏛️  CG TOURISM OS — CANONICAL REGIONAL DATA & CONTENT SEED');
  console.log('════════════════════════════════════════════════════════════════');

  try {
    const divisions = await seedDivisions(prisma);
    console.log(`✅ Seeded ${divisions.length} Divisions`);

    const districts = await seedDistricts(prisma);
    console.log(`✅ Seeded ${districts.length} Districts`);

    const zones = await seedZones(prisma);
    console.log(`✅ Seeded ${zones.length} Tourism Zones`);

    const categories = await seedCategories(prisma);
    console.log(`✅ Seeded ${categories.length} Categories`);

    const places = await seedPlaces(prisma);
    console.log(`✅ Seeded ${places.length} Master Places with Safety Profiles`);

    const experiences = await seedExperiences(prisma);
    console.log(`✅ Seeded ${experiences.length} Experiences`);

    const services = await seedServices(prisma);
    console.log(`✅ Seeded ${services.length} Tourism Services`);

    console.log('════════════════════════════════════════════════════════════════');
    console.log('✨ CANONICAL SEED COMPLETED SUCCESSFULLY (IDEMPOTENT)');
    console.log('════════════════════════════════════════════════════════════════');
  } catch (error) {
    console.error('❌ Error during canonical seed:', error);
    throw error;
  } finally {
    if (shouldDisconnect) {
      await prisma.$disconnect();
    }
  }
}

if (require.main === module) {
  runCanonicalSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
