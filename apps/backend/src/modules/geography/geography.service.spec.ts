import { GeographyService, isValidCoordinates, isInsideChhattisgarhBounds } from './geography.service';

describe('Coordinates', () => {
  it('accepts valid coordinates', () => {
    expect(
      isValidCoordinates({
        latitude: 21.25,
        longitude: 81.63,
      }),
    ).toBe(true);
  });

  it('rejects invalid latitude', () => {
    expect(
      isValidCoordinates({
        latitude: 100,
        longitude: 81,
      }),
    ).toBe(false);
  });

  it('rejects invalid longitude', () => {
    expect(
      isValidCoordinates({
        latitude: 21,
        longitude: 200,
      }),
    ).toBe(false);
  });

  it('rejects NaN', () => {
    expect(
      isValidCoordinates({
        latitude: Number.NaN,
        longitude: 81,
      }),
    ).toBe(false);
  });

  it('verifies regional Chhattisgarh bounding box', () => {
    expect(
      isInsideChhattisgarhBounds({
        latitude: 21.2514,
        longitude: 81.6296, // Raipur
      }),
    ).toBe(true);

    expect(
      isInsideChhattisgarhBounds({
        latitude: 19.0760,
        longitude: 72.8777, // Mumbai (outside CG)
      }),
    ).toBe(false);
  });
});

describe('GeographyService', () => {
  let service: GeographyService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      place: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };
    service = new GeographyService(prisma);
  });

  it('validates place with correct coordinates and district', async () => {
    prisma.place.findUnique.mockResolvedValue({
      id: 'p-1',
      name: 'Chitrakote Falls',
      latitude: 19.2024,
      longitude: 81.7067,
      district: 'Bastar',
    });

    const result = await service.validatePlaceCoordinates('p-1');
    expect(result).not.toBeNull();
    expect(result?.valid).toBe(true);
    expect(result?.insideStateBounds).toBe(true);
    expect(result?.errors).toHaveLength(0);
  });

  it('flags place with coordinates outside boundary or invalid', async () => {
    prisma.place.findUnique.mockResolvedValue({
      id: 'p-2',
      name: 'Out of Bounds Place',
      latitude: 10.0,
      longitude: 70.0,
      district: '',
    });

    const result = await service.validatePlaceCoordinates('p-2');
    expect(result).not.toBeNull();
    expect(result?.valid).toBe(false);
    expect(result?.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('audits all places across regional database', async () => {
    prisma.place.findMany.mockResolvedValue([
      {
        id: 'p-1',
        name: 'Valid Place',
        latitude: 21.25,
        longitude: 81.63,
        district: 'Raipur',
      },
      {
        id: 'p-2',
        name: 'Invalid Place',
        latitude: 999,
        longitude: 999,
        district: null,
      },
    ]);

    const report = await service.auditAllPlaces();
    expect(report.totalPlaces).toBe(2);
    expect(report.validPlaces).toBe(1);
    expect(report.invalidPlaces).toBe(1);
  });

  it('lists divisions with nested districts', async () => {
    prisma.division = {
      findMany: jest.fn().mockResolvedValue([
        { id: 'div-1', name: 'Bastar Division', slug: 'bastar-division', districts: [] },
      ]),
    };

    const result = await service.listDivisions();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bastar Division');
  });

  it('retrieves district by slug with published places', async () => {
    prisma.district = {
      findUnique: jest.fn().mockResolvedValue({
        id: 'dist-1',
        slug: 'bastar',
        name: 'Bastar',
        division: { name: 'Bastar Division' },
        zones: [],
        places: [],
      }),
    };

    const result = await service.getDistrict('bastar');
    expect(result.slug).toBe('bastar');
    expect(result.name).toBe('Bastar');
  });

  it('throws NotFoundException when district slug is not found', async () => {
    prisma.district = {
      findUnique: jest.fn().mockResolvedValue(null),
    };

    await expect(service.getDistrict('non-existent')).rejects.toThrow('District not found');
  });

  it('retrieves tourism zone by slug', async () => {
    prisma.touristZone = {
      findUnique: jest.fn().mockResolvedValue({
        id: 'zone-1',
        slug: 'kanger-valley',
        name: 'Kanger Valley',
        district: { name: 'Bastar' },
        places: [],
      }),
    };

    const result = await service.getZone('kanger-valley');
    expect(result.slug).toBe('kanger-valley');
    expect(result.name).toBe('Kanger Valley');
  });

  it('throws NotFoundException when zone slug is not found', async () => {
    prisma.touristZone = {
      findUnique: jest.fn().mockResolvedValue(null),
    };

    await expect(service.getZone('non-existent-zone')).rejects.toThrow('Tourism zone not found');
  });
});
