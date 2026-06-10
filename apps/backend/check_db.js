const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const places = await prisma.place.findMany({
    where: { verified: true },
    select: { id: true, name: true, verificationLevel: true, categoryId: true, slug: true }
  });
  console.log("Verified Places:", places.length);
  places.forEach(p => console.log(p.name, p.verificationLevel));
}

main().catch(console.error).finally(() => prisma.$disconnect());
