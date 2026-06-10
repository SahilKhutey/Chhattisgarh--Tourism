const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.findFirst();
  if (!category) {
    console.log("No categories found");
    return;
  }

  const aiPlaces = [
    {
      name: "Tamakoni Waterfall (AI Discovered)",
      slug: "tamakoni-waterfall-ai-discovered",
      description: "A newly discovered cascading waterfall deep inside the Bastar forests.",
      district: "Bastar",
      categoryId: category.id,
      latitude: 19.1,
      longitude: 81.9,
      heroImage: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1200&q=80",
      bestSeason: "Monsoon",
      history: "Local legend says this waterfall hides an ancient cave behind its veil.",
      safetyInfo: "Slippery rocks, avoid in heavy rain.",
      rules: "Leave no trace.",
      verified: false,
      verificationLevel: "AI_ESTIMATED",
    },
    {
      name: "Gadiya Mountain Fort (AI Identified)",
      slug: "gadiya-mountain-fort-ai-identified",
      description: "Remnants of an ancient fort structure identified via satellite imagery.",
      district: "Kanker",
      categoryId: category.id,
      latitude: 20.27,
      longitude: 81.49,
      heroImage: "https://images.unsplash.com/photo-1565118531796-763e5082d113?auto=format&fit=crop&w=1200&q=80",
      bestSeason: "Winter",
      history: "A fort of the Kandra kings.",
      safetyInfo: "Steep climb, go during daylight.",
      rules: "Do not vandalize historical stones.",
      verified: false,
      verificationLevel: "AI_ESTIMATED",
    }
  ];

  for (const place of aiPlaces) {
    const existing = await prisma.place.findUnique({ where: { slug: place.slug } });
    if (!existing) {
      await prisma.place.create({ data: place });
      console.log(`Added AI Place: ${place.name}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
