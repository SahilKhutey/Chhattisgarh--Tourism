import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed operations for CG Tourism database...');

  // 1. Clear existing records to ensure clean slate transitions
  await prisma.bookmark.deleteMany();
  await prisma.review.deleteMany();
  await prisma.media.deleteMany();
  await prisma.place.deleteMany();
  await prisma.category.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleaned database tables successfully.');

  // 2. Create User Accounts
  const adminUser = await prisma.user.create({
    data: {
      fullName: 'Chhattisgarh Tourism Administrator',
      email: 'admin@cgtourism.gov.in',
      password: 'secure_admin_hash_placeholder', // In production, hash passwords using bcrypt
      role: 'ADMIN',
    },
  });

  const creatorUser = await prisma.user.create({
    data: {
      fullName: 'Aarav Mandavi',
      email: 'aarav.creator@cgtourism.org',
      password: 'secure_creator_hash_placeholder',
      role: 'CREATOR',
    },
  });

  // 3. Create Creator Profile
  await prisma.creatorProfile.create({
    data: {
      userId: creatorUser.id,
      verified: true,
      bio: 'Bastar-based explorer and folklore preservation volunteer.',
      instagram: 'aarav_bastar_explore',
      youtube: 'BastarWanderer',
    },
  });

  console.log('Created basic User and Creator profiles.');

  // 4. Create Travel Categories
  const categoryWaterfalls = await prisma.category.create({
    data: { name: 'Waterfalls', slug: 'waterfalls' },
  });

  const categoryCaves = await prisma.category.create({
    data: { name: 'Caves & Gorges', slug: 'caves' },
  });

  const categoryTemples = await prisma.category.create({
    data: { name: 'Historic Temples', slug: 'temples' },
  });

  console.log('Populated travel categories.');

  // 5. Populate Landmark Destinations
  const placeChitrakote = await prisma.place.create({
    data: {
      name: 'Chitrakote Waterfalls',
      slug: 'chitrakote-falls',
      description: 'Widest waterfall in India, often referred to as the Niagara of India. Fed by the Indravati River, it creates a spectacular horseshoe-shaped cascade that changes character dramatically across seasons.',
      district: 'Bastar',
      categoryId: categoryWaterfalls.id,
      latitude: 19.2006,
      longitude: 81.6961,
      heroImage: 'https://images.unsplash.com/photo-1628105740446-c2ba68bf65ef?q=80&w=800',
      bestSeason: 'July to October (Monsoon Peak)',
      history: 'Sacred waters revered by the local Gond and Maria clans. Named in ancient regional scriptures detailing wilderness crossings.',
      safetyInfo: 'Strict warning barriers present at canyon borders. Do not descend deep below cascades without certified regional rangers.',
      rules: 'Single-use plastics are strictly prohibited past the security checkpoint. Do not bring litter into the sanctuary.',
      verified: true,
    },
  });

  const placeKutumsar = await prisma.place.create({
    data: {
      name: 'Kutumsar Caves',
      slug: 'kutumsar-caves',
      description: 'Stunning subterranean limestone caves located deep inside the Kanger Valley National Park. Known for beautiful stalactite and stalagmite structural formations and specialized blind cave fish.',
      district: 'Bastar',
      categoryId: categoryCaves.id,
      latitude: 18.9667,
      longitude: 81.9333,
      heroImage: 'https://images.unsplash.com/photo-1507163546645-81230e7e1f44?q=80&w=800',
      bestSeason: 'November to May (Dry Season Access Only)',
      history: 'Discovered in the early 20th century by geologists. Known to tribal forest communities for centuries as a sacred dwelling of deep-earth spirits.',
      safetyInfo: 'Oxygen levels drop in deeper pockets. Tour with guides carrying backup torches and gas meters.',
      rules: 'Do not touch stalactites as skin oils halt ancient rock growth. Switch off flash cameras inside bat sectors.',
      verified: true,
    },
  });

  const placeBhoramdeo = await prisma.place.create({
    data: {
      name: 'Bhoramdeo Temple',
      slug: 'bhoramdeo-temple',
      description: 'Finely carved 11th-century temple complex dedicated to Lord Shiva, constructed by the Nagvanshi dynasty. Often called the Khajuraho of Chhattisgarh due to detailed stone architecture carvings.',
      district: 'Kabirdham',
      categoryId: categoryTemples.id,
      latitude: 22.1167,
      longitude: 81.1500,
      heroImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800',
      bestSeason: 'October to March (Winter Season)',
      history: 'Constructed by King Ramachandra of the Phani Nagvanshi dynasty as a central spiritual sanctuary.',
      safetyInfo: 'Safe standard paving walkways available. Keep standard hydration bottles handy.',
      rules: 'Remove footwear before entering the primary sanctum. Respect prayer times and local priests.',
      verified: true,
    },
  });

  console.log('Seeded landmark destinations successfully.');

  // 6. Seed Media Attachments
  await prisma.media.createMany({
    data: [
      {
        url: 'https://images.unsplash.com/photo-1628105740446-c2ba68bf65ef?q=80&w=800',
        type: 'IMAGE',
        placeId: placeChitrakote.id,
      },
      {
        url: 'https://images.unsplash.com/photo-1507163546645-81230e7e1f44?q=80&w=800',
        type: 'IMAGE',
        placeId: placeKutumsar.id,
      },
    ],
  });

  // 7. Seed Reviews
  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Absolutely breathtaking! The roar of Chitrakote during late August is a spiritual experience.',
      userId: creatorUser.id,
      placeId: placeChitrakote.id,
    },
  });

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Error occurred during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
