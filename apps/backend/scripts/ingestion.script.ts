import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { StorageService } from '../src/modules/storage/storage.service';
import { PrismaService } from '../src/database/prisma.service';
import axios from 'axios';
import { extname } from 'path';

// Example structured payload simulating an ethical ingestion manifest
// In production, this would be read from a JSON file provided by the Tourism Board or Licensed Creators.
const INGESTION_MANIFEST = [
  {
    placeName: 'Chitrakote Falls',
    mediaUrl: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716', // Placeholder for demo
    creatorHandle: '@bastar_diaries',
    photographer: 'Rahul Sharma',
    licenseType: 'CREATOR_LICENSED', // Strict licensing parameter
    title: 'Monsoon Flow at Chitrakote',
    description: 'Drone shot capturing the horseshoe shape during peak monsoon.',
  }
];

async function bootstrap() {
  console.log('🚀 Initializing Ethical Media Ingestion Pipeline...');
  
  // Create a headless Nest application context to reuse all our services
  const app = await NestFactory.createApplicationContext(AppModule);
  const storageService = app.get(StorageService);
  const prismaService = app.get(PrismaService);

  for (const item of INGESTION_MANIFEST) {
    console.log(`\n📦 Processing media for: ${item.placeName}`);
    
    // 1. Resolve Destination
    const place = await prismaService.place.findFirst({
      where: { name: { contains: item.placeName } } // Simple fuzzy match for demo
    });

    if (!place) {
      console.warn(`⚠️ Warning: Destination "${item.placeName}" not found in Database. Skipping.`);
      continue;
    }

    try {
      // 2. Safely Download Media
      console.log(`⬇️ Downloading media from verified source: ${item.mediaUrl}`);
      const response = await axios.get(item.mediaUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      
      // Infer mime type and extension (mocking for the demo URL which lacks extension)
      const isVideo = item.mediaUrl.includes('.mp4');
      const mimetype = isVideo ? 'video/mp4' : 'image/jpeg';
      const originalname = `ingest_${Date.now()}${isVideo ? '.mp4' : '.jpg'}`;

      // Create a mock Multer file object expected by StorageService
      const file: any = {
        buffer,
        originalname,
        mimetype,
      };

      // 3. Process via AI & Storage Pipeline
      console.log(`🤖 Passing to Storage/AI Pipeline for processing...`);
      const mediaRecord = await storageService.processAndUploadMedia(file, place.id, {
        title: item.title,
        description: item.description,
        photographer: item.photographer,
        creatorHandle: item.creatorHandle,
      });

      // 4. Force strictly enforce licenseType
      console.log(`🔒 Applying legal license classification: ${item.licenseType}`);
      await prismaService.media.update({
        where: { id: mediaRecord.id },
        data: { license: item.licenseType }
      });

      console.log(`✅ Success! Asset saved to Database with AI tags: ${mediaRecord.tags}`);
    } catch (error) {
      console.error(`❌ Failed to ingest media for ${item.placeName}:`, error.message);
    }
  }

  await app.close();
  console.log('\n🏁 Ingestion Complete.');
}

bootstrap();
