import { PrismaClient, FieldType, TemplateStatus, EntryStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedContentTemplates() {
  console.log('Seeding Generic Tourism Content Templates...');

  // 1. Ensure system / admin user exists for createdBy
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminUser) {
    adminUser = await prisma.user.findFirst();
  }

  const adminId = adminUser ? adminUser.id : 'system-admin';

  // 2. Upsert Destination Template
  const destinationTemplate = await prisma.contentTemplate.upsert({
    where: { slug: 'destination' },
    update: {
      name: 'Tourism Destination',
      description: 'Generic destination template representing waterfalls, temples, wildlife sanctuaries, and cultural heritage sites.',
      icon: 'MapPin',
      status: TemplateStatus.PUBLISHED,
      version: 1,
    },
    create: {
      name: 'Tourism Destination',
      slug: 'destination',
      description: 'Generic destination template representing waterfalls, temples, wildlife sanctuaries, and cultural heritage sites.',
      icon: 'MapPin',
      status: TemplateStatus.PUBLISHED,
      version: 1,
      createdBy: adminId,
    },
  });

  // 3. Define Canonical Fields
  const fields = [
    {
      key: 'title',
      label: 'Destination Name',
      fieldType: FieldType.TEXT,
      required: true,
      order: 0,
      translatable: true,
      options: { minLength: 3, maxLength: 120 },
    },
    {
      key: 'summary',
      label: 'Short Summary',
      fieldType: FieldType.TEXTAREA,
      required: true,
      order: 1,
      translatable: true,
      options: { maxLength: 300 },
    },
    {
      key: 'description',
      label: 'Detailed Description',
      fieldType: FieldType.RICHTEXT,
      required: true,
      order: 2,
      translatable: true,
      options: {},
    },
    {
      key: 'location',
      label: 'Geographic Coordinates',
      fieldType: FieldType.GEO_POINT,
      required: true,
      order: 3,
      translatable: false,
      options: {},
    },
    {
      key: 'district',
      label: 'District',
      fieldType: FieldType.DROPDOWN,
      required: true,
      order: 4,
      translatable: false,
      options: {
        options: [
          { label: 'Bastar', value: 'Bastar' },
          { label: 'Raipur', value: 'Raipur' },
          { label: 'Bilaspur', value: 'Bilaspur' },
          { label: 'Dantewada', value: 'Dantewada' },
          { label: 'Kabirdham', value: 'Kabirdham' },
          { label: 'Mahasamund', value: 'Mahasamund' },
          { label: 'Surguja', value: 'Surguja' },
        ],
      },
    },
    {
      key: 'category',
      label: 'Category',
      fieldType: FieldType.DROPDOWN,
      required: true,
      order: 5,
      translatable: false,
      options: {
        options: [
          { label: 'Waterfall', value: 'WATERFALL' },
          { label: 'Temple & Spiritual', value: 'TEMPLE' },
          { label: 'Wildlife & Nature', value: 'WILDLIFE' },
          { label: 'Heritage & Monument', value: 'HERITAGE' },
          { label: 'Tribal Culture', value: 'CULTURE' },
        ],
      },
    },
    {
      key: 'heroImage',
      label: 'Hero Image URL',
      fieldType: FieldType.IMAGE,
      required: false,
      order: 6,
      translatable: false,
      options: {},
    },
    {
      key: 'gallery',
      label: 'Photo Gallery',
      fieldType: FieldType.GALLERY,
      required: false,
      order: 7,
      translatable: false,
      options: {},
    },
    {
      key: 'tags',
      label: 'Tags',
      fieldType: FieldType.TAGS,
      required: false,
      order: 8,
      translatable: false,
      options: {},
    },
    {
      key: 'entryFee',
      label: 'Entry Fee (INR)',
      fieldType: FieldType.NUMBER,
      required: false,
      order: 9,
      translatable: false,
      options: { min: 0, max: 10000 },
    },
    {
      key: 'bestSeason',
      label: 'Best Time to Visit',
      fieldType: FieldType.TEXT,
      required: false,
      order: 10,
      translatable: true,
      options: {},
    },
    {
      key: 'isAccessible',
      label: 'Wheelchair Accessible',
      fieldType: FieldType.BOOLEAN,
      required: false,
      order: 11,
      translatable: false,
      options: {},
    },
  ];

  for (const f of fields) {
    await prisma.templateField.upsert({
      where: {
        templateId_key: {
          templateId: destinationTemplate.id,
          key: f.key,
        },
      },
      update: {
        label: f.label,
        fieldType: f.fieldType,
        required: f.required,
        order: f.order,
        translatable: f.translatable,
        options: f.options,
      },
      create: {
        templateId: destinationTemplate.id,
        key: f.key,
        label: f.label,
        fieldType: f.fieldType,
        required: f.required,
        order: f.order,
        translatable: f.translatable,
        options: f.options,
      },
    });
  }

  // 4. Create initial TemplateVersion snapshot
  await prisma.templateVersion.upsert({
    where: {
      templateId_version: {
        templateId: destinationTemplate.id,
        version: 1,
      },
    },
    update: {
      snapshot: {
        name: destinationTemplate.name,
        slug: destinationTemplate.slug,
        fields,
      },
    },
    create: {
      templateId: destinationTemplate.id,
      version: 1,
      snapshot: {
        name: destinationTemplate.name,
        slug: destinationTemplate.slug,
        fields,
      },
      createdBy: adminId,
    },
  });

  // 5. Seed sample entries
  const sampleEntries = [
    {
      title: 'Chitrakote Waterfalls',
      summary: 'Often referred to as the Niagara of India, Chitrakote is the widest waterfall in India.',
      description: 'Chitrakote Falls is a natural waterfall on the Indravati River, located approximately 38 km west of Jagdalpur in Bastar district. During the monsoon season, the waterfall spans nearly 300 meters across the horseshoe cliff.',
      location: { lat: 19.201, lng: 81.706 },
      district: 'Bastar',
      category: 'WATERFALL',
      heroImage: '/images/destinations/chitrakote.jpg',
      gallery: ['/images/destinations/chitrakote-1.jpg', '/images/destinations/chitrakote-2.jpg'],
      tags: ['waterfall', 'indravati', 'bastar', 'monsoon', 'nature'],
      entryFee: 0,
      bestSeason: 'July to October',
      isAccessible: true,
    },
    {
      title: 'Bhoramdeo Temple',
      summary: 'An exquisitely carved 11th-century temple complex known as the Khajuraho of Chhattisgarh.',
      description: 'Located amidst the picturesque Maikal range in Kabirdham district, the Bhoramdeo temple was built by the Nagavanshi dynasty between the 7th and 11th centuries. It features intricate stone sculptures depicting deities, celestial nymphs, and mythic scenes.',
      location: { lat: 22.115, lng: 81.144 },
      district: 'Kabirdham',
      category: 'TEMPLE',
      heroImage: '/images/destinations/bhoramdeo.jpg',
      gallery: ['/images/destinations/bhoramdeo-1.jpg'],
      tags: ['temple', 'heritage', 'architecture', 'sculpture'],
      entryFee: 25,
      bestSeason: 'October to March',
      isAccessible: false,
    },
  ];

  for (const entryData of sampleEntries) {
    const existing = await prisma.contentEntry.findFirst({
      where: {
        templateId: destinationTemplate.id,
        region: entryData.district,
        lat: entryData.location.lat,
      },
    });

    if (!existing) {
      await prisma.contentEntry.create({
        data: {
          templateId: destinationTemplate.id,
          data: entryData,
          status: EntryStatus.PUBLISHED,
          authorId: adminId,
          lat: entryData.location.lat,
          lng: entryData.location.lng,
          region: entryData.district,
          reviewedBy: adminId,
          reviewNote: 'Auto-seeded canonical tourism destination entry.',
        },
      });
    }
  }

  console.log('Successfully seeded Destination Content Template and sample entries.');
}

if (require.main === module) {
  seedContentTemplates()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
