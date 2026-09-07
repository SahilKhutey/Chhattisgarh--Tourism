import { BadRequestException } from '@nestjs/common';
import { GeoService } from './geo.service';

describe('GeoService', () => {
  const repository = {
    findNearbyPlaces: jest.fn(),
    findPlacesInBounds: jest.fn(),
    findDivisions: jest.fn(),
    findDistricts: jest.fn(),
    findDistrictByIdOrSlug: jest.fn(),
    findZonesByDistrict: jest.fn(),
    findPlacesByZone: jest.fn(),
  };

  const distanceService = {
    validateCoordinates: jest.fn(),
    haversineMeters: jest.fn(),
  };

  const routingService = {
    route: jest.fn(),
  };

  const service = new GeoService(
    repository as any,
    distanceService as any,
    routingService as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('queries nearby places', async () => {
    repository.findNearbyPlaces.mockResolvedValue([
      {
        id: 'p-1',
        name: 'Chitrakot Falls',
        slug: 'chitrakot-falls',
        latitude: 19.2,
        longitude: 81.85,
        distanceMeters: 1200,
      },
    ]);

    const result = await service.nearby({
      latitude: 19.2,
      longitude: 81.85,
      radiusMeters: 5000,
      limit: 20,
    });

    expect(distanceService.validateCoordinates).toHaveBeenCalledWith({
      latitude: 19.2,
      longitude: 81.85,
    });

    expect(repository.findNearbyPlaces).toHaveBeenCalledWith(
      19.2,
      81.85,
      5000,
      20,
    );

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Chitrakot Falls');
  });

  it('rejects invalid radiusMeters <= 0', async () => {
    await expect(
      service.nearby({
        latitude: 21,
        longitude: 81,
        radiusMeters: 0,
        limit: 10,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('queries places in bounds', async () => {
    repository.findPlacesInBounds.mockResolvedValue([
      { id: 'p-2', name: 'Mainpat', slug: 'mainpat', latitude: 22.8, longitude: 83.2 },
    ]);

    const result = await service.bounds({
      north: 24,
      south: 20,
      east: 84,
      west: 80,
      limit: 50,
    });

    expect(repository.findPlacesInBounds).toHaveBeenCalledWith(24, 20, 84, 80, 50);
    expect(result).toHaveLength(1);
  });

  it('rejects invalid bounds when south > north', async () => {
    await expect(
      service.bounds({
        north: 20,
        south: 22,
        east: 84,
        west: 80,
        limit: 100,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects invalid bounds when west > east', async () => {
    await expect(
      service.bounds({
        north: 24,
        south: 20,
        east: 80,
        west: 84,
        limit: 100,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('retrieves divisions with district counts', async () => {
    repository.findDivisions.mockResolvedValue([
      { id: 'div-1', name: 'Bastar', slug: 'bastar', nameHi: 'बस्तर', code: 'DIV-BASTAR', _count: { districts: 7 } },
    ]);

    const result = await service.getDivisions();
    expect(result).toHaveLength(1);
    expect(result[0].districtCount).toBe(7);
  });

  it('retrieves districts by division', async () => {
    repository.findDistricts.mockResolvedValue([
      { id: 'dist-1', name: 'Raipur', slug: 'raipur', code: 'DIST-RAIPUR', divisionId: 'div-r', _count: { zones: 2, places: 14 } },
    ]);

    const result = await service.getDistricts('div-r');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Raipur');
    expect(result[0].placeCount).toBe(14);
  });
});
