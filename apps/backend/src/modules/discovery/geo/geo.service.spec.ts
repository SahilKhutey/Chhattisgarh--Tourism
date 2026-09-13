import { BadRequestException } from '@nestjs/common';
import { GeoService } from './geo.service';

describe('GeoService', () => {
  let service: GeoService;
  let prisma: { $queryRaw: jest.Mock };
  let redis: { get: jest.Mock; set: jest.Mock };

  beforeEach(() => {
    prisma = { $queryRaw: jest.fn() };
    redis = { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue(undefined) };
    service = new GeoService(prisma as any, redis as any);
  });

  describe('nearby', () => {
    it('queries nearby places with valid coordinates and distance', async () => {
      prisma.$queryRaw.mockResolvedValue([
        {
          id: 'place-1',
          name: 'Chitrakote Waterfall',
          slug: 'chitrakote',
          latitude: 19.2024,
          longitude: 81.7067,
          distanceMeters: 1200,
        },
      ]);

      const result = await service.nearby(19.2, 81.7, 10000);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Chitrakote Waterfall');
      expect(result[0].distanceMeters).toBe(1200);
      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalled();
    });

    it('returns cached nearby results on Redis cache hit', async () => {
      const cached = [{ id: 'cached-1', name: 'Cached Waterfall', distanceMeters: 500 }];
      redis.get.mockResolvedValue(cached);

      const result = await service.nearby(19.2, 81.7, 10000);

      expect(result).toEqual(cached);
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('rejects invalid latitude', async () => {
      await expect(service.nearby(95, 81.7)).rejects.toThrow(BadRequestException);
      await expect(service.nearby(-95, 81.7)).rejects.toThrow(BadRequestException);
    });

    it('rejects invalid longitude', async () => {
      await expect(service.nearby(19.2, 190)).rejects.toThrow(BadRequestException);
      await expect(service.nearby(19.2, -190)).rejects.toThrow(BadRequestException);
    });

    it('rejects radius out of bounds', async () => {
      await expect(service.nearby(19.2, 81.7, 0)).rejects.toThrow(BadRequestException);
      await expect(service.nearby(19.2, 81.7, 250000)).rejects.toThrow(BadRequestException);
    });
  });

  describe('mapViewport', () => {
    it('queries places within bounding box', async () => {
      prisma.$queryRaw.mockResolvedValue([
        {
          id: 'place-1',
          name: 'Tirathgarh Waterfall',
          slug: 'tirathgarh',
          latitude: 18.9,
          longitude: 81.8,
          categoryName: 'Waterfalls',
          categorySlug: 'waterfalls',
        },
      ]);

      const result = await service.mapViewport(20.0, 18.0, 82.0, 80.0, 8);

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('tirathgarh');
      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalled();
    });

    it('rejects inverted bounding box coordinates', async () => {
      // South > North
      await expect(service.mapViewport(18.0, 20.0, 82.0, 80.0)).rejects.toThrow(BadRequestException);
      // West > East
      await expect(service.mapViewport(20.0, 18.0, 80.0, 82.0)).rejects.toThrow(BadRequestException);
    });
  });
});
