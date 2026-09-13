import { PrismaClient } from '@prisma/client';

export const DISTRICTS_DATA = [
  // Raipur Division
  { name: 'Raipur', slug: 'raipur', code: 'CG-RP', divisionCode: 'RAIPUR', lat: 21.2514, lng: 81.6296 },
  { name: 'Baloda Bazar', slug: 'baloda-bazar', code: 'CG-BB', divisionCode: 'RAIPUR', lat: 21.6667, lng: 82.1667 },
  { name: 'Gariaband', slug: 'gariaband', code: 'CG-GB', divisionCode: 'RAIPUR', lat: 20.9667, lng: 82.0833 },
  { name: 'Mahasamund', slug: 'mahasamund', code: 'CG-MH', divisionCode: 'RAIPUR', lat: 21.1083, lng: 82.0967 },
  { name: 'Dhamtari', slug: 'dhamtari', code: 'CG-DH', divisionCode: 'RAIPUR', lat: 20.7083, lng: 81.5497 },

  // Durg Division
  { name: 'Durg', slug: 'durg', code: 'CG-DU', divisionCode: 'DURG', lat: 21.1900, lng: 81.2849 },
  { name: 'Bhilai', slug: 'bhilai', code: 'CG-BH', divisionCode: 'DURG', lat: 21.2135, lng: 81.3784 },
  { name: 'Bemetara', slug: 'bemetara', code: 'CG-BM', divisionCode: 'DURG', lat: 21.7022, lng: 81.5458 },
  { name: 'Balod', slug: 'balod', code: 'CG-BL', divisionCode: 'DURG', lat: 20.7306, lng: 81.2056 },
  { name: 'Rajnandgaon', slug: 'rajnandgaon', code: 'CG-RN', divisionCode: 'DURG', lat: 21.0975, lng: 81.0375 },
  { name: 'Khairagarh-Chhuikhadan-Gandai', slug: 'khairagarh', code: 'CG-KC', divisionCode: 'DURG', lat: 21.4167, lng: 80.9833 },
  { name: 'Mohla-Manpur-Ambagarh Chowki', slug: 'mohla-manpur', code: 'CG-MM', divisionCode: 'DURG', lat: 20.5833, lng: 80.7500 },
  { name: 'Kabirdham', slug: 'kabirdham', code: 'CG-KB', divisionCode: 'DURG', lat: 22.0167, lng: 81.2500 },

  // Bilaspur Division
  { name: 'Bilaspur', slug: 'bilaspur', code: 'CG-BI', divisionCode: 'BILASPUR', lat: 22.0797, lng: 82.1409 },
  { name: 'Mungeli', slug: 'mungeli', code: 'CG-MG', divisionCode: 'BILASPUR', lat: 22.0667, lng: 81.6833 },
  { name: 'Gaurela-Pendra-Marwahi', slug: 'gaurela-pendra-marwahi', code: 'CG-GP', divisionCode: 'BILASPUR', lat: 22.7500, lng: 81.9167 },
  { name: 'Janjgir-Champa', slug: 'janjgir-champa', code: 'CG-JC', divisionCode: 'BILASPUR', lat: 22.0167, lng: 82.5667 },
  { name: 'Sakti', slug: 'sakti', code: 'CG-SK', divisionCode: 'BILASPUR', lat: 22.0333, lng: 82.9667 },
  { name: 'Korba', slug: 'korba', code: 'CG-KO', divisionCode: 'BILASPUR', lat: 22.3595, lng: 82.7501 },
  { name: 'Raigarh', slug: 'raigarh', code: 'CG-RG', divisionCode: 'BILASPUR', lat: 21.8974, lng: 83.3950 },
  { name: 'Sarangarh-Bilaigarh', slug: 'sarangarh-bilaigarh', code: 'CG-SB', divisionCode: 'BILASPUR', lat: 21.6000, lng: 83.0833 },

  // Bastar Division
  { name: 'Bastar', slug: 'bastar', code: 'CG-BA', divisionCode: 'BASTAR', lat: 19.0730, lng: 82.0238 },
  { name: 'Dantewada', slug: 'dantewada', code: 'CG-DA', divisionCode: 'BASTAR', lat: 18.9000, lng: 81.3500 },
  { name: 'Kanker', slug: 'kanker', code: 'CG-KK', divisionCode: 'BASTAR', lat: 20.2719, lng: 81.4931 },
  { name: 'Kondagaon', slug: 'kondagaon', code: 'CG-KN', divisionCode: 'BASTAR', lat: 19.6000, lng: 81.6667 },
  { name: 'Narayanpur', slug: 'narayanpur', code: 'CG-NP', divisionCode: 'BASTAR', lat: 19.7167, lng: 81.2500 },
  { name: 'Sukma', slug: 'sukma', code: 'CG-SKM', divisionCode: 'BASTAR', lat: 18.4000, lng: 81.6667 },
  { name: 'Bijapur', slug: 'bijapur', code: 'CG-BP', divisionCode: 'BASTAR', lat: 18.8000, lng: 80.8167 },

  // Surguja Division
  { name: 'Surguja', slug: 'surguja', code: 'CG-SU', divisionCode: 'SURGUJA', lat: 23.1167, lng: 83.2000 },
  { name: 'Surajpur', slug: 'surajpur', code: 'CG-SJ', divisionCode: 'SURGUJA', lat: 23.2167, lng: 82.8667 },
  { name: 'Balrampur-Ramanujganj', slug: 'balrampur', code: 'CG-BR', divisionCode: 'SURGUJA', lat: 23.6167, lng: 83.6167 },
  { name: 'Koriya', slug: 'koriya', code: 'CG-KR', divisionCode: 'SURGUJA', lat: 23.2500, lng: 82.5500 },
  { name: 'Manendragarh-Chirmiri-Bharatpur', slug: 'manendragarh', code: 'CG-MC', divisionCode: 'SURGUJA', lat: 23.2000, lng: 82.3500 },
  { name: 'Jashpur', slug: 'jashpur', code: 'CG-JS', divisionCode: 'SURGUJA', lat: 22.8833, lng: 84.1500 },
];

export async function seedDistricts(prisma: PrismaClient) {
  console.log('🌱 Seeding 33 Administrative Districts...');
  const divisions = await prisma.division.findMany();
  const divisionMap = new Map(divisions.map((d) => [d.code, d.id]));

  const results = [];
  for (const item of DISTRICTS_DATA) {
    const divisionId = divisionMap.get(item.divisionCode);
    if (!divisionId) {
      console.warn(`Division not found for code: ${item.divisionCode}`);
      continue;
    }

    const record = await prisma.district.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        slug: item.slug,
        latitude: item.lat,
        longitude: item.lng,
        divisionId,
      },
      create: {
        name: item.name,
        slug: item.slug,
        code: item.code,
        latitude: item.lat,
        longitude: item.lng,
        divisionId,
        status: 'ACTIVE',
      },
    });
    results.push(record);
  }
  return results;
}
