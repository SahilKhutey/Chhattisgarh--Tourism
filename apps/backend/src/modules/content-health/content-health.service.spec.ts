import {
  calculateContentHealth,
  calculateContentScore,
  ContentHealthService,
} from './content-health.service';

describe('ContentHealth', () => {
  it('marks complete verified content healthy', () => {
    expect(
      calculateContentHealth({
        hasImage: true,
        hasDescription: true,
        hasCoordinates: true,
        hasDistrict: true,
        verified: true,
        daysSinceUpdate: 10,
      }),
    ).toBe('HEALTHY');
  });

  it('detects missing image', () => {
    expect(
      calculateContentHealth({
        hasImage: false,
        hasDescription: true,
        hasCoordinates: true,
        hasDistrict: true,
        verified: true,
        daysSinceUpdate: 10,
      }),
    ).not.toBe('HEALTHY');
  });

  it('detects incomplete geographic data', () => {
    expect(
      calculateContentHealth({
        hasImage: true,
        hasDescription: true,
        hasCoordinates: false,
        hasDistrict: false,
        verified: true,
        daysSinceUpdate: 10,
      }),
    ).toBe('INCOMPLETE');
  });

  it('computes correct numeric health score', () => {
    const perfectScore = calculateContentScore({
      hasImage: true,
      hasDescription: true,
      hasCoordinates: true,
      hasDistrict: true,
      verified: true,
      daysSinceUpdate: 5,
    });
    expect(perfectScore).toBe(100);

    const penalizedScore = calculateContentScore({
      hasImage: false, // -20
      hasDescription: true,
      hasCoordinates: true,
      hasDistrict: true,
      verified: true,
      daysSinceUpdate: 400, // -10
    });
    expect(penalizedScore).toBe(70);
  });
});

describe('ContentHealthService', () => {
  let service: ContentHealthService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      place: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };
    service = new ContentHealthService(prisma);
  });

  it('returns detailed health report for a place', async () => {
    prisma.place.findUnique.mockResolvedValue({
      id: 'p-1',
      name: 'Barnawapara',
      slug: 'barnawapara',
      heroImage: 'https://images.cg/barnawapara.jpg',
      description: 'A lush wildlife sanctuary featuring rich fauna and deciduous forest.',
      latitude: 21.4,
      longitude: 82.4,
      district: 'Mahasamund',
      verified: true,
      updatedAt: new Date(),
    });

    const report = await service.getPlaceHealth('p-1');
    expect(report.placeId).toBe('p-1');
    expect(report.status).toBe('HEALTHY');
    expect(report.score).toBe(100);
    expect(report.warnings).toHaveLength(0);
  });

  it('summarizes overall content health across repository', async () => {
    prisma.place.findMany.mockResolvedValue([
      {
        id: 'p-1',
        heroImage: 'img.jpg',
        description: 'Detailed description exceeding twenty characters.',
        latitude: 21.2,
        longitude: 81.6,
        district: 'Raipur',
        verified: true,
        updatedAt: new Date(),
      },
      {
        id: 'p-2',
        heroImage: '',
        description: 'Short',
        latitude: null,
        longitude: null,
        district: '',
        verified: false,
        updatedAt: new Date('2020-01-01'),
      },
    ]);

    const summary = await service.getOverallSummary();
    expect(summary.total).toBe(2);
    expect(summary.healthy).toBe(1);
    expect(summary.incomplete).toBe(1);
    expect(summary.healthyPercentage).toBe(50);
  });
});
