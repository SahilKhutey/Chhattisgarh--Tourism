import { BadRequestException } from '@nestjs/common';
import { DistanceService } from './distance.service';

describe('DistanceService', () => {
  let service: DistanceService;

  beforeEach(() => {
    service = new DistanceService();
  });

  it('accepts valid coordinates', () => {
    expect(() =>
      service.validateCoordinates({
        latitude: 21.25,
        longitude: 81.63,
      }),
    ).not.toThrow();
  });

  it('rejects invalid latitude', () => {
    expect(() =>
      service.validateCoordinates({
        latitude: 100,
        longitude: 81,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects invalid longitude', () => {
    expect(() =>
      service.validateCoordinates({
        latitude: 21,
        longitude: 200,
      }),
    ).toThrow(BadRequestException);
  });

  it('returns zero for identical coordinates', () => {
    const distance = service.haversineMeters(
      { latitude: 21, longitude: 81 },
      { latitude: 21, longitude: 81 },
    );
    expect(distance).toBe(0);
  });

  it('calculates a positive distance', () => {
    const distance = service.haversineMeters(
      { latitude: 21, longitude: 81 },
      { latitude: 22, longitude: 82 },
    );
    expect(distance).toBeGreaterThan(0);
  });

  it('is approximately symmetric', () => {
    const a = { latitude: 21, longitude: 81 };
    const b = { latitude: 22, longitude: 82 };

    const first = service.haversineMeters(a, b);
    const second = service.haversineMeters(b, a);

    expect(first).toBeCloseTo(second, 4);
  });
});
