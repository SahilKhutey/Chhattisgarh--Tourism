import { Test, TestingModule } from '@nestjs/testing';
import { FolkloreService } from './folklore.service';
import { PrismaService } from '../../database/prisma.service';

describe('FolkloreService Unit Tests', () => {
  let service: FolkloreService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      folklore: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FolkloreService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<FolkloreService>(FolkloreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFolklore', () => {
    it('should create folklore in PENDING status with verified false and correct authorId', async () => {
      const input = {
        title: 'Legend of Chitrakote',
        monument: 'Chitrakote Falls',
        location: 'Bastar',
        description: 'Ancient legend of the Indravati river and its cascade.',
        images: ['https://cdn.example.com/img1.jpg'],
        videos: ['https://cdn.example.com/vid1.mp4'],
      };

      const mockCreated = {
        id: 'folk-1',
        title: input.title,
        monument: input.monument,
        location: input.location,
        description: input.description,
        images: JSON.stringify(input.images),
        videos: JSON.stringify(input.videos),
        audioUrl: null,
        audioNarrator: null,
        authorId: 'user-123',
        verified: false,
        status: 'PENDING',
        createdAt: new Date(),
      };

      prismaMock.folklore.create.mockResolvedValue(mockCreated);

      const result = await service.createFolklore(input, 'user-123');

      expect(result.id).toBe('folk-1');
      expect(result.status).toBe('PENDING');
      expect(result.verified).toBe(false);
      expect(result.authorId).toBe('user-123');
      expect(result.images).toEqual(input.images);
      expect(result.videos).toEqual(input.videos);

      expect(prismaMock.folklore.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          authorId: 'user-123',
          verified: false,
          status: 'PENDING',
          title: 'Legend of Chitrakote',
        }),
      });
    });
  });

  describe('getVerifiedFolklore', () => {
    it('should query only verified folklore with APPROVED status', async () => {
      const mockList = [
        {
          id: 'folk-approved',
          title: 'Bastariya Dokra Tales',
          monument: 'Bastar Craft Village',
          location: 'Kondagaon',
          description: 'Traditional metal casting lore.',
          images: '["https://cdn.example.com/dokra.jpg"]',
          videos: '[]',
          author: { fullName: 'Suresh Baghel', role: 'USER' },
          verified: true,
          status: 'APPROVED',
        },
      ];

      prismaMock.folklore.findMany.mockResolvedValue(mockList);

      const result = await service.getVerifiedFolklore();

      expect(result.length).toBe(1);
      expect(result[0].images).toEqual(['https://cdn.example.com/dokra.jpg']);
      expect(result[0].videos).toEqual([]);
      expect(prismaMock.folklore.findMany).toHaveBeenCalledWith({
        where: {
          status: 'APPROVED',
          verified: true,
        },
        include: {
          author: {
            select: {
              fullName: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });
});
