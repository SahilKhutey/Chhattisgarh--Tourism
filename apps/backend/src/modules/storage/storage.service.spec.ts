import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { AIService } from './ai.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException } from '@nestjs/common';

jest.mock('sharp', () => {
  const sharpMock = jest.fn(() => ({
    metadata: jest.fn().mockResolvedValue({ width: 1920, height: 1080 }),
    webp: jest.fn().mockReturnThis(),
    resize: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-webp-data')),
  }));
  return sharpMock;
});

describe('StorageService Unit Tests', () => {
  let service: StorageService;
  let aiServiceMock: any;
  let prismaMock: any;

  beforeEach(async () => {
    aiServiceMock = {
      extractImageMetadata: jest.fn().mockResolvedValue({
        tags: ['waterfall', 'nature'],
        dominantColors: ['#0077be', '#2e8b57'],
        aiLabels: ['Water feature', 'Landscape'],
        season: 'MONSOON',
      }),
    };

    prismaMock = {
      media: {
        create: jest.fn().mockImplementation((args: any) =>
          Promise.resolve({
            id: 'media-uuid-1',
            ...args.data,
            uploadedAt: new Date(),
          }),
        ),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: AIService, useValue: aiServiceMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be successfully initialized', () => {
    expect(service).toBeDefined();
  });

  describe('processAndUploadMedia validations', () => {
    it('should throw BadRequestException if file is missing', async () => {
      await expect(
        service.processAndUploadMedia(null as any, 'place-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if file type is not supported', async () => {
      const mockFile: any = {
        originalname: 'malicious.exe',
        buffer: Buffer.from('test-payload'),
        mimetype: 'application/x-msdownload',
      };

      await expect(
        service.processAndUploadMedia(mockFile, 'place-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('processAndUploadMedia pipeline', () => {
    it('should process image, calculate checksum, extract AI metadata, and save with PENDING status', async () => {
      const mockFile: any = {
        originalname: 'chitrakote.jpg',
        buffer: Buffer.from('raw-jpeg-data'),
        mimetype: 'image/jpeg',
      };

      const result = await service.processAndUploadMedia(mockFile, 'place-uuid-1', {
        title: 'Chitrakote Main Falls',
        photographer: 'Rahul Sharma',
        sourceName: 'Department of Tourism',
        sourceUrl: 'https://tourism.cg.gov.in',
      });

      expect(result).toBeDefined();
      expect(result.placeId).toBe('place-uuid-1');
      expect(result.status).toBe('PENDING');
      expect(result.mimeType).toBe('image/webp');
      expect(result.objectKey).toContain('places/place-uuid-1/');
      expect(result.checksumSha256).toBeDefined();
      expect(result.title).toBe('Chitrakote Main Falls');
      expect(result.photographer).toBe('Rahul Sharma');
      expect(result.sourceName).toBe('Department of Tourism');
      expect(result.sourceUrl).toBe('https://tourism.cg.gov.in');

      expect(prismaMock.media.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          placeId: 'place-uuid-1',
          status: 'PENDING',
          mimeType: 'image/webp',
          title: 'Chitrakote Main Falls',
          photographer: 'Rahul Sharma',
        }),
      });
      expect(aiServiceMock.extractImageMetadata).toHaveBeenCalled();
    });

    it('should support video uploads without Sharp transformation', async () => {
      const mockVideo: any = {
        originalname: 'bastar-journey.mp4',
        buffer: Buffer.from('video-mp4-stream'),
        mimetype: 'video/mp4',
      };

      const result = await service.processAndUploadMedia(mockVideo, 'place-uuid-1', {
        title: 'Bastar Journey Video',
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('VIDEO');
      expect(result.mimeType).toBe('video/mp4');
      expect(result.status).toBe('PENDING');
      expect(aiServiceMock.extractImageMetadata).not.toHaveBeenCalled();
    });
  });
});
