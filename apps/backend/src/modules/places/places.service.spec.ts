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
});
