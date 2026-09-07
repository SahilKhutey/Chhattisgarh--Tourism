import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const places = await prisma.place.findMany({
    select: {
      id: true,
      name: true,
      bookingPricePaise: true,
    },
  });

  for (const place of places) {
    if (place.bookingPricePaise === 0) {
      console.log(`Booking price requires configuration: ${place.name}`);
    }
  }

  console.log(`Checked ${places.length} places.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
