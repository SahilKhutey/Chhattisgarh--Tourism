import { PrismaClient } from '@prisma/client';

export const SERVICES_DATA = [
  {
    placeSlug: 'chitrakote-waterfalls',
    name: 'Dandami Luxury Eco Resort',
    type: 'STAY' as const,
    description: 'Chhattisgarh Tourism Board operated luxury log cottages perched directly on the cliff edge facing the waterfall.',
    phone: '+91-7782-229045',
    website: 'https://tourism.cg.gov.in',
  },
  {
    placeSlug: 'chitrakote-waterfalls',
    name: 'Bastar Tribal Guide Collective',
    type: 'GUIDE' as const,
    description: 'Forest department trained local tribal guides proficient in Halbi, Gondi, Hindi, and English folklore interpretation.',
    phone: '+91-7782-229100',
  },
  {
    placeSlug: 'kutumsar-caves',
    name: 'Kanger Valley Forest Department Guide Station',
    type: 'GUIDE' as const,
    description: 'Mandatory registered biospeleology guides equipped with safety gear and kerosene lamps.',
    phone: '+91-7782-228900',
  },
  {
    placeSlug: 'mainpat-plateau',
    name: 'Saila Tourist Resort Mainpat',
    type: 'STAY' as const,
    description: 'Comfortable hilltop cottages with panoramic views of the Surguja mountain valleys.',
    phone: '+91-7774-256789',
    website: 'https://tourism.cg.gov.in',
  },
  {
    placeSlug: 'bhoramdeo-temple',
    name: 'Bhoramdeo Jungle Retreat',
    type: 'STAY' as const,
    description: 'Eco-friendly heritage retreat organizing village walks, Baiga weekly haat visits, and cultural exchanges.',
    phone: '+91-7741-234567',
  },
  {
    placeSlug: 'barnawapara-wildlife-sanctuary',
    name: 'Hareli Eco Tourism Complex',
    type: 'STAY' as const,
    description: 'Cottages inside the sanctuary buffer zone offering morning and evening open-gypsy safari bookings.',
    phone: '+91-7727-245123',
    website: 'https://forest.cg.gov.in',
  },
];

export async function seedServices(prisma: PrismaClient) {
  console.log('🌱 Seeding Tourism Services...');
  const results = [];
  for (const s of SERVICES_DATA) {
    const place = await prisma.place.findUnique({
      where: { slug: s.placeSlug },
    });

    if (!place) {
      console.warn(`Place not found for service: ${s.placeSlug}`);
      continue;
    }

    const record = await prisma.tourismService.create({
      data: {
        name: s.name,
        type: s.type,
        description: s.description,
        phone: s.phone,
        website: s.website,
        placeId: place.id,
        isActive: true,
      },
    });
    results.push(record);
  }
  return results;
}
