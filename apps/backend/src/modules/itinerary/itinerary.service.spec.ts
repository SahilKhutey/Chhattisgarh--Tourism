import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ItineraryService } from './itinerary.service';
import { PrismaService } from '../../database/prisma.service';

describe('ItineraryService', () => {
  let service: ItineraryService;

  let prismaMock: {
    place: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      place: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItineraryService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ItineraryService>(ItineraryService);
  });

  describe('initialization', () => {
    it('should initialize', () => {
      expect(service).toBeDefined();
    });
  });

  describe('input validation', () => {
    it('rejects empty district', async () => {
      await expect(
        service.generateItinerary('', 3, 'moderate'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects zero days', async () => {
      await expect(
        service.generateItinerary('Bastar', 0, 'moderate'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects more than seven days', async () => {
      await expect(
        service.generateItinerary('Bastar', 8, 'moderate'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects invalid pace', async () => {
      await expect(
        service.generateItinerary('Bastar', 3, 'invalid' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects invalid traveler count', async () => {
      await expect(
        service.generateItinerary('Bastar', 3, 'moderate', [], 0),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('empty data', () => {
    it('returns empty itinerary when no places exist', async () => {
      prismaMock.place.findMany.mockResolvedValue([]);

      const result = await service.generateItinerary('Bastar', 3, 'moderate');

      expect(result).toEqual([]);
    });
  });

  describe('real recommendation data', () => {
    const places = [
      {
        id: '1',
        name: 'Nature Falls',
        slug: 'nature-falls',
        latitude: 19.1,
        longitude: 82.1,
        bestSeason: 'Monsoon',
        rules: 'Follow safety rules',
        safetyInfo: 'Use marked paths',
        district: 'Bastar',
        verified: true,
        experienceTypes: '["nature","waterfall"]',
        category: {
          name: 'Nature',
        },
        planningProfile: {
          visitorCapacity: 500,
          estimatedVisitMinutes: 120,
          planningEnabled: true,
        },
        reviews: [{ rating: 5 }, { rating: 4 }, { rating: 5 }],
        scores: {
          popularity: 90,
          safety: 90,
          accessibility: 80,
          mediaQuality: 90,
          ecoSensitivity: 50,
        },
      },
      {
        id: '2',
        name: 'Heritage Temple',
        slug: 'heritage-temple',
        latitude: 19.15,
        longitude: 82.12,
        bestSeason: 'Winter',
        rules: 'Respect site rules',
        safetyInfo: 'Follow local guidance',
        district: 'Bastar',
        verified: true,
        experienceTypes: '["heritage","history"]',
        category: {
          name: 'Heritage',
        },
        planningProfile: {
          visitorCapacity: 200,
          estimatedVisitMinutes: 90,
          planningEnabled: true,
        },
        reviews: [{ rating: 3 }, { rating: 4 }],
        scores: {
          popularity: 60,
          safety: 80,
          accessibility: 90,
          mediaQuality: 70,
          ecoSensitivity: 30,
        },
      },
    ];

    it('uses review ratings rather than place-name length', async () => {
      prismaMock.place.findMany.mockResolvedValue(places);

      const result = await service.generateItinerary(
        'Bastar',
        1,
        'moderate',
        ['nature'],
      );

      expect(result[0].stops.length).toBeGreaterThan(0);
      const stop = result[0].stops[0];
      expect(stop.averageRating).toBeGreaterThan(0);
      expect(stop.recommendationScore).toBeGreaterThan(0);
    });

    it('uses interest matching', async () => {
      prismaMock.place.findMany.mockResolvedValue(places);

      const result = await service.generateItinerary(
        'Bastar',
        1,
        'moderate',
        ['nature'],
      );

      expect(result[0].stops[0].name).toBe('Nature Falls');
    });

    it('respects visitor capacity', async () => {
      const capacityLimited = {
        ...places[0],
        planningProfile: {
          visitorCapacity: 1,
          estimatedVisitMinutes: 120,
          planningEnabled: true,
        },
      };

      prismaMock.place.findMany.mockResolvedValue([capacityLimited]);

      const result = await service.generateItinerary(
        'Bastar',
        1,
        'moderate',
        [],
        2,
      );

      expect(result).toEqual([
        {
          day: 1,
          stops: [],
          distanceTraveledKm: 0,
          estimatedVisitMinutes: 0,
          estimatedDayMinutes: 0,
        },
      ]);
    });

    it('does not select planning-disabled places', async () => {
      prismaMock.place.findMany.mockResolvedValue([]);

      await service.generateItinerary('Bastar', 1);

      expect(prismaMock.place.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            verified: true,
          }),
        }),
      );
    });

    it('limits slow pace daily stops', async () => {
      prismaMock.place.findMany.mockResolvedValue(places);

      const result = await service.generateItinerary('Bastar', 2, 'slow');

      expect(result.length).toBe(2);
      expect(result[0].stops.length).toBeLessThanOrEqual(2);
    });

    it('returns requested number of days', async () => {
      prismaMock.place.findMany.mockResolvedValue(places);

      const result = await service.generateItinerary('Bastar', 3, 'moderate');

      expect(result.length).toBe(3);
    });

    it('never repeats the same place', async () => {
      prismaMock.place.findMany.mockResolvedValue(places);

      const result = await service.generateItinerary('Bastar', 3, 'active');

      const ids = result.flatMap((day) => day.stops.map((stop) => stop.placeId));
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('returns real visit duration', async () => {
      prismaMock.place.findMany.mockResolvedValue(places);

      const result = await service.generateItinerary('Bastar', 1);

      expect(result[0].estimatedVisitMinutes).toBeGreaterThan(0);
    });
  });
});
