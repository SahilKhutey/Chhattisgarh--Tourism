import { Test, TestingModule } from '@nestjs/testing';
import { ItineraryService } from './itinerary.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('ItineraryService Unit Tests', () => {
  let service: ItineraryService;
  let prismaMock: any;

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

  it('should be successfully initialized', () => {
    expect(service).toBeDefined();
  });

  describe('generateItinerary boundary checks', () => {
    it('should throw BadRequestException if duration is less than 1 or greater than 7', async () => {
      await expect(service.generateItinerary('Bastar', 0)).rejects.toThrow(BadRequestException);
      await expect(service.generateItinerary('Bastar', 8)).rejects.toThrow(BadRequestException);
    });

    it('should return empty list if no places are found in the district', async () => {
      prismaMock.place.findMany.mockResolvedValue([]);
      const result = await service.generateItinerary('Bastar', 3);
      expect(result).toEqual([]);
    });
  });

  describe('itinerary generation algorithms', () => {
    const mockPlaces = [
      {
        id: '1',
        name: 'Chitrakote Falls',
        slug: 'chitrakote-falls',
        district: 'Bastar',
        verified: true,
        latitude: 21.2800,
        longitude: 81.8700,
        bestSeason: 'Monsoon',
        rules: 'Do not swim close to falls',
      },
      {
        id: '2',
        name: 'Teerathgarh Falls',
        slug: 'teerathgarh-falls',
        district: 'Bastar',
        verified: true,
        latitude: 21.3500,
        longitude: 81.8800,
        bestSeason: 'Winter',
        rules: 'Follow safety signs',
      },
      {
        id: '3',
        name: 'Kanger Valley National Park',
        slug: 'kanger-valley',
        district: 'Bastar',
        verified: true,
        latitude: 21.6000,
        longitude: 81.9000,
        bestSeason: 'Winter',
        rules: 'Do not litter',
      },
    ];

    it('should correctly cluster places based on pacing limits', async () => {
      prismaMock.place.findMany.mockResolvedValue(mockPlaces);

      // With active pace, the traveler can cover more distance, so they can visit multiple destinations in Day 1
      const activeItinerary = await service.generateItinerary('Bastar', 2, 'active');
      expect(activeItinerary.length).toBe(2);
      expect(activeItinerary[0].stops.length).toBeGreaterThan(0);
      
      // Let's verify structure
      expect(activeItinerary[0]).toHaveProperty('day', 1);
      expect(activeItinerary[0]).toHaveProperty('stops');
      expect(activeItinerary[0]).toHaveProperty('distanceTraveledKm');
      expect(activeItinerary[0].stops[0]).toHaveProperty('name');
      expect(activeItinerary[0].stops[0]).toHaveProperty('coordinates');
    });

    it('should respect slow pacing and split destinations across multiple days due to distance limitations', async () => {
      prismaMock.place.findMany.mockResolvedValue(mockPlaces);

      // Chitrakote to Teerathgarh is around ~36km.
      // Under 'slow' pace (30km limit), the algorithm shouldn't visit both in the same day if the total distance exceeds 30km.
      const slowItinerary = await service.generateItinerary('Bastar', 3, 'slow');
      
      expect(slowItinerary.length).toBe(3);
      // Let's ensure day 1 doesn't exceed 30km limit
      expect(slowItinerary[0].distanceTraveledKm).toBeLessThanOrEqual(30.0);
    });
  });
});
