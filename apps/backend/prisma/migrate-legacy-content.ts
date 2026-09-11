import { PrismaClient } from '@prisma/client';
import { destinationTemplate } from './data/templates/destination';
import { folkloreTemplate } from './data/templates/folklore';

const prisma = new PrismaClient();

function parseJson(value: unknown): unknown[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return value.split(',').map((s) => s.trim());
    }
  }
  return [];
}

function createSlug(title: string, id: string): string {
  const clean = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${clean || 'item'}-${id.slice(0, 8)}`;
}

async function resolveAuthor(authorId?: string | null): Promise<string> {
  if (authorId) {
    const exists = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true },
    });
    if (exists) return exists.id;
  }

  const admin = await prisma.user.findFirst({
    where: {
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  if (admin) return admin.id;

  const anyUser = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  if (!anyUser) {
    throw new Error('Cannot migrate legacy content: No user exists in database.');
  }

  return anyUser.id;
}

async function migratePlaces(templateId: string) {
  const places = await prisma.place.findMany();
  let migrated = 0;
  let errors = 0;

  for (const place of places) {
    try {
      const data = {
        title: place.name,
        slug: place.slug,
        description: place.description,
        district: place.district,
        category: place.categoryId,
        location: {
          latitude: place.latitude,
          longitude: place.longitude,
          lat: place.latitude,
          lng: place.longitude,
        },
        heroImage: place.heroImage,
        bestSeason: place.bestSeason,
        history: place.history,
        safetyInfo: place.safetyInfo,
        rules: place.rules,
        highlights: parseJson(place.highlights),
        experienceTypes: parseJson(place.experienceTypes),
        platformFeatures: parseJson(place.platformFeatures),
        recommendedMedia: parseJson(place.recommendedMedia),
      };

      const authorId = await resolveAuthor((place as any).ownerId);
      const status = place.verified ? 'PUBLISHED' : 'PENDING_REVIEW';

      await prisma.contentEntry.upsert({
        where: {
          templateId_slug: {
            templateId,
            slug: place.slug,
          },
        },
        update: {
          data: data as any,
          latitude: place.latitude,
          longitude: place.longitude,
          region: place.district,
          district: place.district,
        },
        create: {
          templateId,
          templateVersion: 1,
          slug: place.slug,
          data: data as any,
          status: status as any,
          authorId,
          region: place.district,
          district: place.district,
          latitude: place.latitude,
          longitude: place.longitude,
          publishedAt: place.verified ? new Date() : null,
        },
      });

      migrated++;
    } catch (err) {
      console.error(`Error migrating place ${place.name} (${place.slug}):`, err);
      errors++;
    }
  }

  console.log(`Migrated ${migrated} destinations (${errors} errors).`);
  return { total: places.length, migrated, errors };
}

async function migrateFolklore(templateId: string) {
  const entries = await prisma.folklore.findMany();
  let migrated = 0;
  let errors = 0;

  for (const item of entries) {
    try {
      const slug = createSlug(item.title, item.id);
      const data = {
        title: item.title,
        monument: item.monument,
        location: item.location,
        description: item.description,
        images: parseJson(item.images),
        videos: parseJson(item.videos),
        audio: item.audioUrl,
        audioNarrator: item.audioNarrator,
      };

      const authorId = await resolveAuthor(item.authorId);
      const status = item.verified ? 'PUBLISHED' : 'PENDING_REVIEW';

      await prisma.contentEntry.upsert({
        where: {
          templateId_slug: {
            templateId,
            slug,
          },
        },
        update: {
          data: data as any,
        },
        create: {
          templateId,
          templateVersion: 1,
          slug,
          data: data as any,
          status: status as any,
          authorId,
          publishedAt: item.verified ? new Date() : null,
        },
      });

      migrated++;
    } catch (err) {
      console.error(`Error migrating folklore ${item.title}:`, err);
      errors++;
    }
  }

  console.log(`Migrated ${migrated} folklore entries (${errors} errors).`);
  return { total: entries.length, migrated, errors };
}

async function main() {
  console.log('=== Chhattisgarh Tourism: Legacy Content Migration ===');

  const admin = await prisma.user.findFirst({
    where: {
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    },
    orderBy: { createdAt: 'asc' },
  });

  const defaultAdminId = admin ? admin.id : 'system-admin';

  // 1. Ensure Destination Template
  const destination = await prisma.contentTemplate.upsert({
    where: { slug: destinationTemplate.slug },
    update: {},
    create: {
      name: destinationTemplate.name,
      slug: destinationTemplate.slug,
      description: destinationTemplate.description,
      createdBy: defaultAdminId,
      createdById: admin?.id,
      status: 'PUBLISHED',
      version: 1,
      publishedVersion: 1,
      fields: {
        create: destinationTemplate.fields.map((f) => ({
          key: f.key,
          label: f.label,
          fieldType: f.fieldType as any,
          required: f.required,
          order: f.order,
          translatable: f.translatable,
        })),
      },
    },
    include: { fields: true },
  });

  console.log(`Destination template verified (id: ${destination.id})`);

  // 2. Ensure Folklore Template
  const folklore = await prisma.contentTemplate.upsert({
    where: { slug: folkloreTemplate.slug },
    update: {},
    create: {
      name: folkloreTemplate.name,
      slug: folkloreTemplate.slug,
      description: folkloreTemplate.description,
      createdBy: defaultAdminId,
      createdById: admin?.id,
      status: 'PUBLISHED',
      version: 1,
      publishedVersion: 1,
      fields: {
        create: folkloreTemplate.fields.map((f) => ({
          key: f.key,
          label: f.label,
          fieldType: f.fieldType as any,
          required: f.required,
          order: f.order,
          translatable: f.translatable,
        })),
      },
    },
    include: { fields: true },
  });

  console.log(`Folklore template verified (id: ${folklore.id})`);

  // 3. Migrate Records
  const placeStats = await migratePlaces(destination.id);
  const folkloreStats = await migrateFolklore(folklore.id);

  console.log('=== Migration Verification Summary ===');
  console.log(`Places: ${placeStats.migrated}/${placeStats.total} migrated.`);
  console.log(`Folklore: ${folkloreStats.migrated}/${folkloreStats.total} migrated.`);
  console.log('Legacy migration completed successfully.');
}

main()
  .catch((e) => {
    console.error('Fatal migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
