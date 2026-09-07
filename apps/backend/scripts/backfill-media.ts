import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join, extname } from 'path';

const prisma = new PrismaClient();

interface BackfillSummary {
  placesScanned: number;
  placesHeroImageUpdated: number;
  placesStatusNormalized: number;
  mediaScanned: number;
  mediaMetadataEnriched: number;
  mediaStatusNormalized: number;
}

async function runBackfill() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log('────────────────────────────────────────────────────────────');
  console.log(`🚀 Starting CG Tourism Media & Place Backfill Pipeline`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (No database writes)' : 'PRODUCTION LIVE'}`);
  console.log('────────────────────────────────────────────────────────────\n');

  const summary: BackfillSummary = {
    placesScanned: 0,
    placesHeroImageUpdated: 0,
    placesStatusNormalized: 0,
    mediaScanned: 0,
    mediaMetadataEnriched: 0,
    mediaStatusNormalized: 0,
  };

  const uploadDir = join(process.cwd(), 'uploads');

  // 1. Scan and normalize Places
  const places = await prisma.place.findMany({
    include: {
      media: {
        orderBy: { uploadedAt: 'asc' },
      },
    },
  });

  summary.placesScanned = places.length;
  console.log(`📍 Found ${places.length} places to inspect.`);

  for (const place of places) {
    let shouldUpdatePlace = false;
    const placeUpdates: Record<string, any> = {};

    // Check contentStatus consistency
    if (place.verified && place.contentStatus !== 'APPROVED') {
      placeUpdates.contentStatus = 'APPROVED';
      if (!place.verificationLevel || place.verificationLevel === 'UNVERIFIED') {
        placeUpdates.verificationLevel = 'OFFICIAL';
      }
      if (!place.verifiedAt) {
        placeUpdates.verifiedAt = place.updatedAt || new Date();
      }
      shouldUpdatePlace = true;
      summary.placesStatusNormalized++;
    } else if (!place.verified && !place.contentStatus) {
      placeUpdates.contentStatus = 'PENDING_REVIEW';
      shouldUpdatePlace = true;
      summary.placesStatusNormalized++;
    }

    // Check missing heroImage
    if (!place.heroImage && place.media && place.media.length > 0) {
      const firstImage = place.media.find((m) => m.type === 'IMAGE' && m.url);
      if (firstImage) {
        placeUpdates.heroImage = firstImage.url;
        shouldUpdatePlace = true;
        summary.placesHeroImageUpdated++;
      }
    }

    if (shouldUpdatePlace && !isDryRun) {
      await prisma.place.update({
        where: { id: place.id },
        data: placeUpdates,
      });
    }
  }

  // 2. Scan and backfill Media records
  const mediaRecords = await prisma.media.findMany({
    include: {
      place: true,
    },
  });

  summary.mediaScanned = mediaRecords.length;
  console.log(`🖼️ Found ${mediaRecords.length} media records to inspect.`);

  for (const media of mediaRecords) {
    let shouldUpdateMedia = false;
    const mediaUpdates: Record<string, any> = {};

    // Status normalization
    if (!media.status || media.status === 'PENDING') {
      const targetStatus = media.place?.verified ? 'APPROVED' : 'PENDING';
      if (media.status !== targetStatus) {
        mediaUpdates.status = targetStatus;
        shouldUpdateMedia = true;
        summary.mediaStatusNormalized++;
      }
    }

    // Inferred mimeType
    const ext = extname(media.url.split('?')[0] || '').toLowerCase();
    let mimeType = media.mimeType;
    if (!mimeType) {
      if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.mp4') mimeType = 'video/mp4';
      else if (ext === '.webm') mimeType = 'video/webm';
      else mimeType = media.type === 'VIDEO' ? 'video/mp4' : 'image/jpeg';
      mediaUpdates.mimeType = mimeType;
      shouldUpdateMedia = true;
    }

    // Object key
    if (!media.objectKey) {
      const fallbackExt = ext || (media.type === 'VIDEO' ? '.mp4' : '.jpg');
      mediaUpdates.objectKey = `places/${media.placeId}/legacy-${media.id}${fallbackExt}`;
      shouldUpdateMedia = true;
    }

    // Checksum & file size calculation if local file exists
    if (!media.checksumSha256 || !media.fileSize) {
      const localFilename = media.url.replace(/^\/?uploads\//, '');
      const localPath = join(uploadDir, localFilename);

      if (existsSync(localPath)) {
        try {
          const buffer = readFileSync(localPath);
          mediaUpdates.fileSize = buffer.length;
          mediaUpdates.checksumSha256 = createHash('sha256').update(buffer).digest('hex');
          shouldUpdateMedia = true;
        } catch {
          // ignore local read failure
        }
      }

      // If still missing checksum, generate deterministic hash from URL + placeId
      if (!mediaUpdates.checksumSha256 && !media.checksumSha256) {
        mediaUpdates.checksumSha256 = createHash('sha256')
          .update(`${media.placeId}:${media.url}`)
          .digest('hex');
        shouldUpdateMedia = true;
      }
    }

    if (shouldUpdateMedia) {
      summary.mediaMetadataEnriched++;
      if (!isDryRun) {
        await prisma.media.update({
          where: { id: media.id },
          data: mediaUpdates,
        });
      }
    }
  }

  console.log('\n────────────────────────────────────────────────────────────');
  console.log('📊 Backfill Execution Summary:');
  console.log(`- Places Scanned:               ${summary.placesScanned}`);
  console.log(`- Places Status Normalized:     ${summary.placesStatusNormalized}`);
  console.log(`- Places Hero Images Backfilled:${summary.placesHeroImageUpdated}`);
  console.log(`- Media Records Scanned:        ${summary.mediaScanned}`);
  console.log(`- Media Metadata Enriched:      ${summary.mediaMetadataEnriched}`);
  console.log(`- Media Status Normalized:      ${summary.mediaStatusNormalized}`);
  console.log(`- Dry Run Flag:                 ${isDryRun}`);
  console.log('────────────────────────────────────────────────────────────\n');
}

runBackfill()
  .catch((err) => {
    console.error('❌ Backfill failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
