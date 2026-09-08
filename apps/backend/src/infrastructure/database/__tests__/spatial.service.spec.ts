import { SpatialService } from '../spatial.service';

describe('SpatialService', () => {
  const prisma = {
    $executeRaw: jest.fn(),
  };

  const service = new SpatialService(prisma as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('accepts valid coordinates and executes PostGIS query', async () => {
    prisma.$executeRaw.mockResolvedValue(1);

    await service.setEntryLocation('entry-1', 21.2514, 81.6296);

    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it('rejects invalid latitude (< -90)', async () => {
    await expect(service.setEntryLocation('entry-1', -95, 81)).rejects.toThrow(
      'Invalid latitude',
    );
  });

  it('rejects invalid latitude (> 90)', async () => {
    await expect(service.setEntryLocation('entry-1', 100, 81)).rejects.toThrow(
      'Invalid latitude',
    );
  });

  it('rejects invalid longitude (< -180)', async () => {
    await expect(service.setEntryLocation('entry-1', 21, -190)).rejects.toThrow(
      'Invalid longitude',
    );
  });

  it('rejects invalid longitude (> 180)', async () => {
    await expect(service.setEntryLocation('entry-1', 21, 200)).rejects.toThrow(
      'Invalid longitude',
    );
  });

  it('clears entry location successfully', async () => {
    prisma.$executeRaw.mockResolvedValue(1);

    await service.clearEntryLocation('entry-1');

    expect(prisma.$executeRaw).toHaveBeenCalled();
  });
});
