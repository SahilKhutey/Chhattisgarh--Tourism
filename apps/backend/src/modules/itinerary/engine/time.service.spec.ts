import { TravelTimeService } from './time.service';

describe('TravelTimeService', () => {
  let service: TravelTimeService;

  beforeEach(() => {
    service = new TravelTimeService();
  });

  it('calculates travel duration with road factor', () => {
    // 35 km straight line * 1.25 road factor = 43.75 km road / 35 kmh = 1.25h = 75 min
    const minutes = service.estimateMinutes(35, 35);
    expect(minutes).toBe(75);
  });

  it('returns 0 for zero distance', () => {
    expect(service.estimateMinutes(0)).toBe(0);
  });

  it('rejects invalid speed', () => {
    expect(() => service.estimateMinutes(10, 0)).toThrow('Invalid travel parameters');
  });

  it('rejects negative distance', () => {
    expect(() => service.estimateMinutes(-10, 35)).toThrow('Invalid travel parameters');
  });

  it('computes accurate Haversine distance between coordinates', () => {
    // Raipur (21.2514, 81.6296) to Bilaspur (22.0796, 82.1391) is ~106 km
    const dist = service.distanceKm(
      { latitude: 21.2514, longitude: 81.6296 },
      { latitude: 22.0796, longitude: 82.1391 },
    );
    expect(dist).toBeGreaterThan(100);
    expect(dist).toBeLessThan(120);
  });
});
