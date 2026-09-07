import { Test, TestingModule } from '@nestjs/testing';
import { PlacesService } from './places.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('PlacesService Unit Tests', () => {
  let service: PlacesService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      place: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        groupBy: jest.fn(),
      },
      category: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<PlacesService>(PlacesService);
  });

  it('should be successfully initialized', () => {
    expect(service).toBeDefined();
  });

  describe('slug creation and validations pass', () => {
    it('should sanitize names with special characters into clean lowercase slugs', async () => {
      const createDto = {
        name: '  Chitrakote Waterfalls Peak!!!  ',
        description: 'Widest waterfall cascade in India.',
        district: 'Bastar',
        categoryId: 'waterfalls-uuid',
        latitude: 19.2006,
        longitude: 81.6961,
        heroImage: 'https://images.unsplash.com/photo-1628105740446-c2ba68bf65ef',
      };

      prismaMock.place.findUnique.mockResolvedValue(null);
      prismaMock.place.create.mockImplementation((args: any) => Promise.resolve(args.data));

      const result = await service.create(createDto);

      expect(result.slug).toBe('chitrakote-waterfalls-peak');
      expect(result.name).toBe(createDto.name);
      expect(result.verified).toBe(false); // Staged unverified by default
    });

    it('should throw BadRequestException if a matching slug already exists', async () => {
      const createDto = {
        name: 'Chitrakote Falls',
        description: 'Widest waterfall cascade in India.',
        district: 'Bastar',
        categoryId: 'waterfalls-uuid',
        latitude: 19.2006,
        longitude: 81.6961,
        heroImage: 'https://images.unsplash.com/photo-1628105740446-c2ba68bf65ef',
      };

      // Mock database conflict hit
      prismaMock.place.findUnique.mockResolvedValue({ id: 'exists-id', slug: 'chitrakote-falls' });

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findNearby PostGIS and Haversine backup checks', () => {
    it('should trigger PostGIS $queryRaw bounds querying if extension is enabled', async () => {
      const mockPlaces = [
        { id: '1', name: 'Chitrakote', latitude: 19.20, longitude: 81.69, distance_km: 1.2 },
      ];
      prismaMock.$queryRaw.mockResolvedValue(mockPlaces);

      const result = await service.findNearby(19.2005, 81.6998, 10);

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Chitrakote');
      expect(prismaMock.$queryRaw).toHaveBeenCalled();
    });

    it('should fallback gracefully to trigonometric Haversine sorting if PostGIS raw query throws', async () => {
      // Simulate raw query failing due to PostGIS database extension missing locally
      prismaMock.$queryRaw.mockRejectedValue(new Error('Relation "Place" or PostGIS ST_Distance does not exist'));

      const mockDbPlaces = [
        { id: '1', name: 'Chitrakote Falls', latitude: 19.2006, longitude: 81.6961, verified: true },
        { id: '2', name: 'Bhoramdeo Temple', latitude: 22.1167, longitude: 81.1500, verified: true },
      ];
      prismaMock.place.findMany.mockResolvedValue(mockDbPlaces);

      // Search near Bastar Falls coordinates
      const result = await service.findNearby(19.2005, 81.6998, 50);

      expect(result.length).toBe(1); // Only Chitrakote within 50km
      expect(result[0].name).toBe('Chitrakote Falls');
      expect(result[0].distance_km).toBeLessThan(1);
      expect(prismaMock.place.findMany).toHaveBeenCalled();
    });
  });

  describe('categories and districts retrieval', () => {
    it('should return categories with place counts', async () => {
      prismaMock.category.findMany.mockResolvedValue([
        { id: 'cat-1', name: 'Waterfall', slug: 'waterfall', _count: { places: 12 } },
        { id: 'cat-2', name: 'Cave', slug: 'cave', _count: { places: 5 } },
      ]);

      const result = await service.getCategories();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'cat-1',
        name: 'Waterfall',
        slug: 'waterfall',
        placeCount: 12,
      });
      expect(prismaMock.category.findMany).toHaveBeenCalledWith({
        include: { _count: { select: { places: true } } },
        orderBy: { name: 'asc' },
      });
    });

    it('should return districts with place counts and exclude Unknown', async () => {
      prismaMock.place.groupBy.mockResolvedValue([
        { district: 'Bastar', _count: { id: 25 } },
        { district: 'Surguja', _count: { id: 14 } },
        { district: 'Unknown', _count: { id: 0 } },
      ]);

      const result = await service.getDistricts();

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { name: 'Bastar', placeCount: 25 },
        { name: 'Surguja', placeCount: 14 },
      ]);
      expect(prismaMock.place.groupBy).toHaveBeenCalledWith({
        by: ['district'],
        where: { verified: true },
        _count: { id: true },
        orderBy: { district: 'asc' },
      });
    });
  });

  describe('findAll filtering and search', () => {
    it('should filter by category and district', async () => {
      prismaMock.place.findMany.mockResolvedValue([
        { id: '1', name: 'Chitrakote Falls', district: 'Bastar', verified: true, contentStatus: 'APPROVED' },
      ]);

      const result = await service.findAll('waterfall', 'Bastar');

      expect(result).toHaveLength(1);
      expect(prismaMock.place.findMany).toHaveBeenCalledWith({
        where: {
          verified: true,
          contentStatus: 'APPROVED',
          category: { slug: 'waterfall' },
          district: { equals: 'Bastar', mode: 'insensitive' },
        },
        include: {
          category: true,
          media: {
            where: { status: 'APPROVED' },
            orderBy: { uploadedAt: 'desc' },
          },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('should apply text search across name, description, and district', async () => {
      prismaMock.place.findMany.mockResolvedValue([
        { id: '1', name: 'Chitrakote Falls', district: 'Bastar', verified: true, contentStatus: 'APPROVED' },
      ]);

      await service.findAll(undefined, undefined, 'Chitrakote');

      expect(prismaMock.place.findMany).toHaveBeenCalledWith({
        where: {
          verified: true,
          contentStatus: 'APPROVED',
          OR: [
            { name: { contains: 'Chitrakote', mode: 'insensitive' } },
            { description: { contains: 'Chitrakote', mode: 'insensitive' } },
            { district: { contains: 'Chitrakote', mode: 'insensitive' } },
          ],
        },
        include: {
          category: true,
          media: {
            where: { status: 'APPROVED' },
            orderBy: { uploadedAt: 'desc' },
          },
        },
        orderBy: { name: 'asc' },
      });
    });
  });
});
