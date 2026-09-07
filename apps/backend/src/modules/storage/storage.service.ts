import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID, createHash } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as sharp from 'sharp';
import { AIService } from './ai.service';
import { PrismaService } from '../../database/prisma.service';

export interface MediaUploadCustomMetadata {
  title?: string;
  description?: string;
  photographer?: string;
  creatorHandle?: string;
  sourceUrl?: string;
  sourceName?: string;
  license?: string;
  status?: string;
}

@Injectable()
export class StorageService {
  private readonly uploadDir = join(process.cwd(), 'uploads');
  private s3Client: S3Client | null = null;
  private readonly logger = new Logger(StorageService.name);

  constructor(
    private readonly aiService: AIService,
    private readonly prisma: PrismaService,
  ) {
    this.ensureUploadDirectoryExists();

    const { S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY } = process.env;
    if (S3_ENDPOINT && S3_ACCESS_KEY && S3_SECRET_KEY) {
      this.s3Client = new S3Client({
        endpoint: S3_ENDPOINT,
        region: S3_REGION || 'auto',
        credentials: {
          accessKeyId: S3_ACCESS_KEY,
          secretAccessKey: S3_SECRET_KEY,
        },
      });
      this.logger.log('S3 Client initialized (Cloudflare R2 / AWS S3)');
    } else {
      this.logger.warn('S3 credentials not found. Falling back to local disk storage.');
    }
  }

  private ensureUploadDirectoryExists() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Uploads a file, processes it, extracts AI metadata, and creates a Media record.
   */
  async processAndUploadMedia(
    file: Express.Multer.File,
    placeId: string,
    customMetadata?: MediaUploadCustomMetadata,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided for upload.');
    }

    const fileExt = extname(file.originalname).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(fileExt);
    const isVideo = ['.mp4', '.webm'].includes(fileExt);

    if (!isImage && !isVideo) {
      throw new BadRequestException(`Unsupported file type: ${fileExt}`);
    }

    // 1. Optimization (Images -> WebP via Sharp)
    let processedBuffer = file.buffer;
    let finalExt = fileExt;
    let mimeType = file.mimetype || (isVideo ? 'video/mp4' : 'image/jpeg');
    let width: number | null = null;
    let height: number | null = null;

    if (isImage) {
      try {
        const sharpFn = (sharp as any).default || sharp;
        const initialMeta = await sharpFn(file.buffer).metadata();
        width = initialMeta.width || null;
        height = initialMeta.height || null;

        processedBuffer = await sharpFn(file.buffer)
          .webp({ quality: 80 })
          .resize({ width: 1920, withoutEnlargement: true })
          .toBuffer();

        const processedMeta = await sharpFn(processedBuffer).metadata();
        width = processedMeta.width || width;
        height = processedMeta.height || height;
        finalExt = '.webp';
        mimeType = 'image/webp';
      } catch (sharpError) {
        this.logger.warn(`Sharp processing failed; using original buffer: ${sharpError.message}`);
        processedBuffer = file.buffer;
      }
    }

    const uniqueFileName = `${randomUUID()}${finalExt}`;
    const objectKey = `places/${placeId}/${uniqueFileName}`;
    const fileSize = processedBuffer.length;
    const checksumSha256 = createHash('sha256').update(processedBuffer).digest('hex');

    let fileUrl = '';

    // 2. Storage
    if (this.s3Client && process.env.S3_BUCKET_NAME) {
      // Upload to S3/R2
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: objectKey,
        Body: processedBuffer,
        ContentType: mimeType,
      });
      await this.s3Client.send(command);
      const publicUrlBase = (process.env.S3_PUBLIC_URL || '').replace(/\/+$/, '');
      fileUrl = publicUrlBase ? `${publicUrlBase}/${objectKey}` : `/${objectKey}`;
    } else {
      // Local fallback
      const filePath = join(this.uploadDir, uniqueFileName);
      writeFileSync(filePath, processedBuffer);
      fileUrl = `/uploads/${uniqueFileName}`;
    }

    // 3. AI Metadata Extraction (Only for images currently)
    let aiMetadata: { tags: string[]; dominantColors: string[]; aiLabels: string[]; season?: string } = {
      tags: [],
      dominantColors: [],
      aiLabels: [],
      season: undefined,
    };
    if (isImage) {
      try {
        aiMetadata = await this.aiService.extractImageMetadata(mimeType, processedBuffer);
      } catch (err) {
        this.logger.error('AI Metadata extraction failed, proceeding without AI tags.', err);
      }
    }

    // 4. Save to Database
    const mediaType = isVideo ? 'VIDEO' : 'IMAGE';

    return this.prisma.media.create({
      data: {
        url: fileUrl,
        objectKey,
        type: mediaType,
        mimeType,
        fileSize,
        width,
        height,
        checksumSha256,
        sourceUrl: customMetadata?.sourceUrl || null,
        sourceName: customMetadata?.sourceName || null,
        status: customMetadata?.status || 'PENDING',
        placeId,

        // Custom metadata if provided
        title: customMetadata?.title || file.originalname,
        description: customMetadata?.description || null,
        photographer: customMetadata?.photographer || null,
        creatorHandle: customMetadata?.creatorHandle || null,
        license: customMetadata?.license || null,

        // AI Extracted Metadata
        tags: JSON.stringify(aiMetadata.tags || []),
        dominantColors: JSON.stringify(aiMetadata.dominantColors || []),
        aiLabels: JSON.stringify(aiMetadata.aiLabels || []),
        season: aiMetadata.season || null,
      },
    });
  }

  // Backwards compatibility for existing routes
  async saveFile(file: Express.Multer.File): Promise<string> {
    const uniqueFileName = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
    const filePath = join(this.uploadDir, uniqueFileName);
    writeFileSync(filePath, file.buffer);
    return `/uploads/${uniqueFileName}`;
  }
}
