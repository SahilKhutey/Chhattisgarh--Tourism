import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if we have a creator
  const creator = await prisma.creatorProfile.findFirst({
    where: { verified: true }
  });

  if (!creator) {
    console.log("No verified creator found. Cannot seed mock social post.");
    return;
  }

  // Create a mock pending social post
  const mockPost = await prisma.aggregatedContent.create({
    data: {
      socialId: `mock-ig-${Date.now()}`,
      platform: 'INSTAGRAM',
      creatorId: creator.id,
      rawMetadata: JSON.stringify({ mock: true }),
      mediaUrl: 'https://picsum.photos/seed/mock-ig/1200/800',
      thumbnailUrl: 'https://picsum.photos/seed/mock-ig/400/400',
      caption: 'Just visited the amazing Bastar region! The tribal culture here is absolutely breathtaking. #CGTourism #Explore',
      isTravelRelated: true,
      detectedLocation: 'Bastar',
      detectedCategory: 'Culture',
      suggestedTags: JSON.stringify(['culture', 'bastar', 'tribal']),
      status: 'PENDING'
    }
  });

  const mockPost2 = await prisma.aggregatedContent.create({
    data: {
      socialId: `mock-yt-${Date.now()}`,
      platform: 'YOUTUBE',
      creatorId: creator.id,
      rawMetadata: JSON.stringify({ mock: true }),
      mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://picsum.photos/seed/mock-yt/400/400',
      caption: 'I bought some new shoes today! Unboxing video.',
      isTravelRelated: false,
      detectedLocation: 'Unknown',
      detectedCategory: 'Lifestyle',
      suggestedTags: JSON.stringify(['shoes', 'unboxing']),
      status: 'PENDING'
    }
  });

  console.log(`Successfully seeded 2 mock posts: ${mockPost.id}, ${mockPost2.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
