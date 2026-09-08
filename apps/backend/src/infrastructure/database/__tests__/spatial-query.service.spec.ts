import { SpatialQueryService } from '../spatial-query.service';

describe('SpatialQueryService', () => {
  const prisma = {
    $queryRaw: jest.fn(),
  };

  const service = new SpatialQueryService(prisma as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('queries nearby published entries with valid coordinates and positive radius', async () => {
    const mockNearby = [
      { id: 'e1', title: 'Chitrakote Falls', distance_meters: 250 },
    ];
    prisma.$queryRaw.mockResolvedValue(mockNearby);

    const result = await service.findNearby(19.201, 81.706, 5000);

    expect(prisma.$queryRaw).toHaveBeenCalled();
    expect(result).toEqual(mockNearby);
  });

  it('rejects invalid latitude in spatial search', async () => {
    await expect(service.findNearby(95, 81.706, 5000)).rejects.toThrow(
      'Invalid latitude',
    );
  });

  it('rejects invalid longitude in spatial search', async () => {
    await expect(service.findNearby(19.201, 195, 5000)).rejects.toThrow(
      'Invalid longitude',
    );
  });

  it('rejects non-positive radius', async () => {
    await expect(service.findNearby(19.201, 81.706, 0)).rejects.toThrow(
      'Radius must be positive',
    );
    await expect(service.findNearby(19.201, 81.706, -100)).rejects.toThrow(
      'Radius must be positive',
    );
  });
});
