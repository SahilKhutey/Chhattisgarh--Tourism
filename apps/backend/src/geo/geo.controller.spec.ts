import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';

describe('GeoController', () => {
  let controller: GeoController;
  let service: GeoService;

  beforeEach(() => {
    service = {
      nearby: jest.fn().mockResolvedValue([]),
      bounds: jest.fn().mockResolvedValue([]),
      route: jest.fn().mockResolvedValue({ distanceMeters: 1000, durationSeconds: 60, geometry: [] }),
      getDivisions: jest.fn().mockResolvedValue([]),
      getDistricts: jest.fn().mockResolvedValue([]),
      getDistrict: jest.fn().mockResolvedValue({ id: '1', name: 'Raipur' }),
      getZones: jest.fn().mockResolvedValue([]),
      getPlacesByZone: jest.fn().mockResolvedValue([]),
    } as any;

    controller = new GeoController(service);
  });

  it('forwards nearby query to geoService', async () => {
    await controller.nearby({ latitude: 21, longitude: 81, radiusMeters: 5000, limit: 10 });
    expect(service.nearby).toHaveBeenCalledWith({ latitude: 21, longitude: 81, radiusMeters: 5000, limit: 10 });
  });

  it('forwards bounds query to geoService', async () => {
    await controller.bounds({ north: 24, south: 20, east: 84, west: 80, limit: 100 });
    expect(service.bounds).toHaveBeenCalledWith({ north: 24, south: 20, east: 84, west: 80, limit: 100 });
  });

  it('forwards route query to geoService', async () => {
    await controller.route({ originLat: 21, originLng: 81, destLat: 22, destLng: 82 });
    expect(service.route).toHaveBeenCalledWith({ originLat: 21, originLng: 81, destLat: 22, destLng: 82 });
  });

  it('forwards getDivisions call', async () => {
    await controller.getDivisions();
    expect(service.getDivisions).toHaveBeenCalled();
  });
});
