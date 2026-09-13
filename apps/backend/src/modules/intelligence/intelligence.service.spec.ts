import {
  calculateDestinationPerformance,
  IntelligenceService,
} from './intelligence.service';

describe('DestinationPerformance', () => {
  it('calculates engagement rate', () => {
    const result = calculateDestinationPerformance({
      views: 1000,
      saves: 100,
      shares: 50,
      bookings: 20,
      rating: 4.5,
    });

    expect(result.engagementRate).toBe(0.15);
  });

  it('calculates conversion rate', () => {
    const result = calculateDestinationPerformance({
      views: 1000,
      saves: 100,
      shares: 50,
      bookings: 20,
      rating: 4.5,
    });

    expect(result.conversionRate).toBe(0.02);
  });

  it('handles zero views', () => {
    const result = calculateDestinationPerformance({
      views: 0,
      saves: 10,
      shares: 5,
      bookings: 1,
      rating: 4,
    });

    expect(result.engagementRate).toBe(0);
    expect(result.conversionRate).toBe(0);
  });
});

describe('IntelligenceService', () => {
  let service: IntelligenceService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      analyticsEvent: {
        groupBy: jest.fn(),
        count: jest.fn(),
      },
      tourismMetric: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'tm-1', ...data })),
      },
      place: {
        findMany: jest.fn(),
      },
    };
    service = new IntelligenceService(prisma);
  });

  it('generates daily metrics', async () => {
    prisma.analyticsEvent.groupBy.mockResolvedValue([
      { type: 'PAGE_VIEW', _count: { _all: 500 } },
      { type: 'BOOKING_COMPLETED', _count: { _all: 25 } },
    ]);

    const results = await service.generateDailyMetrics(new Date('2026-09-07'));
    expect(results).toHaveLength(2);
    expect(prisma.tourismMetric.create).toHaveBeenCalledTimes(2);
    expect(prisma.tourismMetric.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          metric: 'PAGE_VIEW',
          value: 500,
        }),
      }),
    );
  });

  it('returns intelligence summary with core dashboard metrics', async () => {
    prisma.analyticsEvent.groupBy.mockResolvedValue([
      { type: 'PAGE_VIEW', _count: { _all: 12430 } },
      { type: 'SEARCH', _count: { _all: 8920 } },
      { type: 'BOOKING_COMPLETED', _count: { _all: 1240 } },
      { type: 'SOS_TRIGGERED', _count: { _all: 7 } },
    ]);

    const from = new Date('2026-09-01');
    const to = new Date('2026-09-08');

    const summary = await service.getSummary(from, to);
    expect(summary.metrics.visitors).toBe(12430);
    expect(summary.metrics.searches).toBe(8920);
    expect(summary.metrics.bookings).toBe(1240);
    expect(summary.metrics.sos).toBe(7);
    expect(summary.events).toHaveLength(4);
  });

  it('computes regional demand indices by district', async () => {
    prisma.analyticsEvent.groupBy.mockResolvedValue([
      { districtId: 'Bastar', type: 'PLACE_VIEW', _count: { _all: 300 } },
      { districtId: 'Bastar', type: 'SEARCH', _count: { _all: 100 } },
      { districtId: 'Bastar', type: 'BOOKING_COMPLETED', _count: { _all: 50 } },
      { districtId: 'Raipur', type: 'PLACE_VIEW', _count: { _all: 50 } },
    ]);

    const demand = await service.getRegionalDemand(14);
    expect(demand).toHaveLength(2);
    expect(demand[0].district).toBe('Bastar');
    expect(demand[0].views).toBe(300);
    expect(demand[0].searches).toBe(100);
    expect(demand[0].bookings).toBe(50);
    expect(demand[0].demandIndex).toBeGreaterThan(0.5);
    expect(demand[0].demandLevel).toBe('SURGING');
  });

  it('computes emerging destinations based on search velocity', async () => {
    prisma.analyticsEvent.groupBy
      .mockResolvedValueOnce([
        { placeId: 'place-bastar', _count: { _all: 120 } },
      ])
      .mockResolvedValueOnce([
        { placeId: 'place-bastar', _count: { _all: 40 } },
      ]);

    prisma.place.findMany.mockResolvedValue([
      { id: 'place-bastar', name: 'Tirathgarh Falls', district: 'Bastar' },
    ]);

    const emerging = await service.getEmergingDestinations(5);
    expect(emerging).toHaveLength(1);
    expect(emerging[0].name).toBe('Tirathgarh Falls');
    expect(emerging[0].currentViews).toBe(120);
    expect(emerging[0].priorViews).toBe(40);
    expect(emerging[0].velocityPercent).toBe(200.0);
  });
});

