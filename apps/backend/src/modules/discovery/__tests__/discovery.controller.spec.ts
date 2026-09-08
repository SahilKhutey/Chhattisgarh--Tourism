import { DiscoveryController } from '../discovery.controller';

describe('DiscoveryController', () => {
  let controller: DiscoveryController;
  let service: any;

  beforeEach(() => {
    service = {
      search: jest.fn(),
      nearby: jest.fn(),
      bounds: jest.fn(),
      suggest: jest.fn(),
      index: jest.fn(),
      rebuild: jest.fn(),
    };
    controller = new DiscoveryController(service);
  });

  it('calls service.search with query parameters', async () => {
    service.search.mockResolvedValue({ items: [], pagination: {}, filters: {} });
    await controller.search({ q: 'test', page: 1, limit: 20 });
    expect(service.search).toHaveBeenCalledWith({
      q: 'test',
      templateId: undefined,
      region: undefined,
      division: undefined,
      district: undefined,
      page: 1,
      limit: 20,
    });
  });

  it('calls service.nearby with coordinates and radius', async () => {
    service.nearby.mockResolvedValue([]);
    await controller.nearby({ lat: 21.2, lng: 81.6, radiusKm: 30, limit: 10 });
    expect(service.nearby).toHaveBeenCalledWith(21.2, 81.6, 30, 10);
  });

  it('calls service.bounds with bounding coordinates', async () => {
    service.bounds.mockResolvedValue([]);
    await controller.bounds({ north: 24, south: 18, east: 84, west: 80 });
    expect(service.bounds).toHaveBeenCalledWith(24, 18, 84, 80);
  });

  it('calls service.suggest with query and parsed limit', async () => {
    service.suggest.mockResolvedValue(['waterfall']);
    await controller.suggestions('wat', '5');
    expect(service.suggest).toHaveBeenCalledWith('wat', 5);
  });

  it('calls service.index on indexGet and indexPost', async () => {
    service.index.mockResolvedValue(undefined);
    const resGet = await controller.indexGet('entry-1');
    const resPost = await controller.indexPost('entry-2');
    expect(service.index).toHaveBeenCalledWith('entry-1');
    expect(service.index).toHaveBeenCalledWith('entry-2');
    expect(resGet).toEqual({ success: true, entryId: 'entry-1' });
    expect(resPost).toEqual({ success: true, entryId: 'entry-2' });
  });

  it('calls service.rebuild', async () => {
    service.rebuild.mockResolvedValue({ processed: 10, indexed: 10, failed: 0 });
    const res = await controller.rebuild();
    expect(service.rebuild).toHaveBeenCalled();
    expect(res.processed).toBe(10);
  });
});
