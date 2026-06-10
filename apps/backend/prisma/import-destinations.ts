import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting batch import of destinations...');
  
  const batchFile = path.join(__dirname, 'data', 'destinations', 'batch_real.json');
  if (!fs.existsSync(batchFile)) {
    console.error('Batch file not found:', batchFile);
    process.exit(1);
  }

  const destinationsData = JSON.parse(fs.readFileSync(batchFile, 'utf8'));
  console.log(`Found ${destinationsData.length} destinations to import.`);

  // Cache categories
  const categories = await prisma.category.findMany();
  const categoryMap: { [slug: string]: string } = {};
  categories.forEach(c => { categoryMap[c.slug] = c.id; });

  for (const item of destinationsData) {
    const categoryId = categoryMap[item.categorySlug];
    if (!categoryId) {
      console.warn(`Category ${item.categorySlug} not found for ${item.name}`);
      continue;
    }

    const createdPlace = await prisma.place.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.tagline,
        district: item.district,
        categoryId,
        latitude: item.latitude,
        longitude: item.longitude,
        heroImage: item.heroImage,
        bestSeason: item.bestTime,
        history: item.story,
        safetyInfo: item.safety,
        rules: item.ecoGuidance,
      },
      create: {
        slug: item.slug,
        name: item.name,
        description: item.tagline,
        district: item.district,
        categoryId,
        latitude: item.latitude,
        longitude: item.longitude,
        heroImage: item.heroImage,
        bestSeason: item.bestTime,
        history: item.story,
        safetyInfo: item.safety,
        rules: item.ecoGuidance,
        verified: true,
      }
    });

    // Handle Media
    await prisma.media.deleteMany({ where: { placeId: createdPlace.id } });
    if (item.media && item.media.length > 0) {
      await prisma.media.createMany({
        data: item.media.map((m: any) => ({
          placeId: createdPlace.id,
          url: m.url,
          type: m.type
        }))
      });
    }

    // Handle Translations
    await prisma.translation.deleteMany({
      where: { entityType: 'Place', entityId: createdPlace.id }
    });

    for (const lang of ['hi', 'cg', 'en']) {
      const trans = item.translations[lang];
      if (trans) {
        for (const [field, value] of Object.entries(trans)) {
          if (value) {
            await prisma.translation.create({
              data: {
                lang,
                entityType: 'Place',
                entityId: createdPlace.id,
                field,
                value: value as string
              }
            });
          }
        }
      }
    }
  }

  console.log('Batch import finished successfully.');
}

main()
  .catch((e) => {
    console.error('Error occurred during batch import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
