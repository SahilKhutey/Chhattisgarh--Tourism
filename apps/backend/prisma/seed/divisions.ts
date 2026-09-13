import { PrismaClient } from '@prisma/client';

export const DIVISIONS_DATA = [
  {
    name: 'Raipur Division',
    slug: 'raipur-division',
    nameHi: 'रायपुर संभाग',
    code: 'RAIPUR',
  },
  {
    name: 'Bilaspur Division',
    slug: 'bilaspur-division',
    nameHi: 'बिलासपुर संभाग',
    code: 'BILASPUR',
  },
  {
    name: 'Durg Division',
    slug: 'durg-division',
    nameHi: 'दुर्ग संभाग',
    code: 'DURG',
  },
  {
    name: 'Bastar Division',
    slug: 'bastar-division',
    nameHi: 'बस्तर संभाग',
    code: 'BASTAR',
  },
  {
    name: 'Surguja Division',
    slug: 'surguja-division',
    nameHi: 'सरगुजा संभाग',
    code: 'SURGUJA',
  },
];

export async function seedDivisions(prisma: PrismaClient) {
  console.log('🌱 Seeding 5 Administrative Divisions...');
  const results = [];
  for (const div of DIVISIONS_DATA) {
    const record = await prisma.division.upsert({
      where: { code: div.code },
      update: {
        name: div.name,
        slug: div.slug,
        nameHi: div.nameHi,
      },
      create: {
        name: div.name,
        slug: div.slug,
        nameHi: div.nameHi,
        code: div.code,
        status: 'ACTIVE',
      },
    });
    results.push(record);
  }
  return results;
}
