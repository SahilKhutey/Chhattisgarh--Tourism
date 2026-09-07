import { DistanceService } from './distance.service';
import { RoutingService } from './routing.service';

describe('RoutingService', () => {
  let routingService: RoutingService;
  let distanceService: DistanceService;

  beforeEach(() => {
    distanceService = new DistanceService();
    routingService = new RoutingService(distanceService);
  });

  it('calculates fallback geometric route between Raipur and Bilaspur', async () => {
    const origin = { latitude: 21.2514, longitude: 81.6296 };
    const destination = { latitude: 22.0797, longitude: 82.1409 };

    const result = await routingService.route(origin, destination);

    expect(result.distanceMeters).toBeGreaterThan(50_000);
    expect(result.durationSeconds).toBeGreaterThan(1800);
    expect(result.geometry.length).toBeGreaterThanOrEqual(10);
    expect(result.geometry[0][0]).toBeCloseTo(origin.latitude, 2);
    expect(result.geometry[result.geometry.length - 1][0]).toBeCloseTo(destination.latitude, 2);
  });
});
