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
});
