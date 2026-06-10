const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const realImages = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chitrakot_waterfalls.JPG/1280px-Chitrakot_waterfalls.JPG",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bhoramdeo_Temple%2C_Kawardha.jpg/1280px-Bhoramdeo_Temple%2C_Kawardha.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/MAINPAT%2CAMBIKAPUR_CG.jpg/1280px-MAINPAT%2CAMBIKAPUR_CG.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Danteswari_Temple_0034.jpg/1280px-Danteswari_Temple_0034.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/1/19/Kanger_valley_National_Park.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mahanadi_from_Banki.jpg/1280px-Mahanadi_from_Banki.jpg"
];

const exactMap = {
  "chitrakote-falls": realImages[0],
  "tirathgarh-falls": realImages[4],
  "kanger-valley-national-park": realImages[4],
  "bhoramdeo-temple": realImages[1],
  "danteshwari-temple": realImages[3],
  "mainpat": realImages[2],
  "sirpur": realImages[1], // fallback
  "achanakmar-tiger-reserve": realImages[4],
  "barnawapara-wildlife-sanctuary": realImages[4],
  "gangrel-dam": realImages[5]
};

async function updateDb() {
  const places = await prisma.place.findMany({ select: { id: true, slug: true, heroImage: true } });
  
  for (let i = 0; i < places.length; i++) {
    const p = places[i];
    let newHeroImage = p.heroImage;
    
    // Check if heroImage needs replacing
    if (p.heroImage && (p.heroImage.includes('unsplash.com') || p.heroImage.includes('placehold.co') || p.heroImage.includes('fallback.jpg'))) {
        newHeroImage = exactMap[p.slug] || realImages[i % realImages.length];
    }
    
    if (newHeroImage !== p.heroImage) {
        await prisma.place.update({
            where: { id: p.id },
            data: { heroImage: newHeroImage }
        });
    }
    
    // Check media
    const placeMedia = await prisma.media.findMany({ where: { placeId: p.id } });
    for (let j = 0; j < placeMedia.length; j++) {
        const m = placeMedia[j];
        if (m.url && (m.url.includes('unsplash.com') || m.url.includes('placehold.co') || m.url.includes('fallback.jpg'))) {
            let mediaUrl = exactMap[p.slug] || realImages[(i + j + 1) % realImages.length];
            await prisma.media.update({
                where: { id: m.id },
                data: { url: mediaUrl }
            });
        }
    }
  }
  console.log('Database image URLs updated successfully.');
  await prisma.$disconnect();
}

updateDb().catch(e => {
  console.error(e);
  process.exit(1);
});
