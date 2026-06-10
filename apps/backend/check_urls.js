const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const places = await prisma.place.findMany({
    select: { slug: true, heroImage: true }
  });
  
  let unsplashUrls = 0;
  let otherUrls = 0;
  
  places.forEach(p => {
    if (p.heroImage && p.heroImage.includes('unsplash.com')) {
      unsplashUrls++;
      if (unsplashUrls <= 5) console.log(p.slug, p.heroImage);
    } else if (p.heroImage) {
      otherUrls++;
      if (otherUrls <= 5) console.log(p.slug, p.heroImage);
    }
  });
  
  console.log(`Unsplash: ${unsplashUrls}, Other: ${otherUrls}, Total: ${places.length}`);
  
  // also check place.media
  const placesWithMedia = await prisma.place.findMany({
    select: { slug: true, media: true }
  });
  let mediaUnsplash = 0;
  placesWithMedia.forEach(p => {
    if (p.media && p.media.length > 0) {
      const media = p.media;
      media.forEach(m => {
        if (m.url && m.url.includes('unsplash.com')) mediaUnsplash++;
      });
    }
  });
  console.log(`Unsplash in Media: ${mediaUnsplash}`);
  
  await prisma.$disconnect();
}

check();
