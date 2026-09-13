import { AnalyticsService } from './analytics.service';
import { AnalyticsEventType } from './types/analytics-event.type';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      analyticsEvent: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'evt-123', ...data })),
        groupBy: jest.fn(),
        count: jest.fn(),
      },
      booking: {
        count: jest.fn(),
        aggregate: jest.fn(),
      },
    };

    service = new AnalyticsService(prisma);
  });

  it('stores an analytics event', async () => {
    const event = await service.track({
      type: AnalyticsEventType.PLACE_VIEW,
      placeId: 'place-1',
    });

    expect(event.type).toBe(AnalyticsEventType.PLACE_VIEW);
    expect(prisma.analyticsEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: AnalyticsEventType.PLACE_VIEW,
          placeId: 'place-1',
        }),
      }),
    );
  });

  it('stores geographic context', async () => {
    const event = await service.track({
      type: AnalyticsEventType.MAP_VIEW,
      latitude: 21.25,
      longitude: 81.63,
    });

    expect(event.latitude).toBe(21.25);
    expect(event.longitude).toBe(81.63);
  });

  it('supports metadata', async () => {
    const event = await service.track({
      type: AnalyticsEventType.SEARCH,
      metadata: {
        query: 'waterfall',
      },
    });

    expect(event.metadata).toEqual({
      query: 'waterfall',
    });
  });

  it('counts events by type', async () => {
    prisma.analyticsEvent.groupBy.mockResolvedValue([
      { type: AnalyticsEventType.PAGE_VIEW, _count: { _all: 42 } },
    ]);

    const res = await service.countByType(new Date('2026-09-01'), new Date('2026-09-08'));
    expect(res).toHaveLength(1);
    expect(res[0]._count._all).toBe(42);
  });

  it('counts place views', async () => {
    prisma.analyticsEvent.count.mockResolvedValue(150);

    const count = await service.placeViews('place-1', new Date('2026-09-01'), new Date('2026-09-08'));
    expect(count).toBe(150);
    expect(prisma.analyticsEvent.count).toHaveBeenCalledWith({
      where: {
        placeId: 'place-1',
        type: AnalyticsEventType.PLACE_VIEW,
        createdAt: {
          gte: new Date('2026-09-01'),
          lte: new Date('2026-09-08'),
        },
      },
    });
  });

  it('returns booking monetization metrics and revenue aggregations', async () => {
    prisma.booking.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(60)
      .mockResolvedValueOnce(20);

    prisma.booking.aggregate
      .mockResolvedValueOnce({ _sum: { totalPricePaise: 5000000 } })
      .mockResolvedValueOnce({ _sum: { platformFeePaise: 250000 } });

    const result = await service.bookingMetrics();

    expect(result.bookings).toBe(100);
    expect(result.confirmed).toBe(20);
    expect(result.completed).toBe(60);
    expect(result.cancelled).toBe(20);
    expect(result.grossBookingValuePaise).toBe(5000000);
    expect(result.platformRevenuePaise).toBe(250000);
  });

  it('sanitizes sensitive fields from metadata before persisting', async () => {
    const event = await service.track({
      type: AnalyticsEventType.PAGE_VIEW,
      metadata: {
        page: '/places/chitrakote',
        password: 'superSecretPassword123',
        authToken: 'jwt-token-xyz',
        apiKey: 'gemini-key-123',
        nested: {
          authorization: 'Bearer secret-jwt',
          normalKey: 'safe-value',
        },
      },
    });

    expect(event.metadata).toEqual({
      page: '/places/chitrakote',
      password: '[REDACTED]',
      authToken: '[REDACTED]',
      apiKey: '[REDACTED]',
      nested: {
        authorization: '[REDACTED]',
        normalKey: 'safe-value',
      },
    });
  });

  it('aggregates district trends sorted descending by event count', async () => {
    prisma.analyticsEvent.groupBy.mockResolvedValue([
      { districtId: 'bastar', _count: { _all: 120 } },
      { districtId: 'raipur', _count: { _all: 85 } },
    ]);

    const trends = await service.getDistrictTrends(30);

    expect(trends).toEqual([
      { districtId: 'bastar', count: 120 },
      { districtId: 'raipur', count: 85 },
    ]);
  });

  it('returns place engagement metrics across views, saves, and shares', async () => {
    prisma.analyticsEvent.count
      .mockResolvedValueOnce(300) // views
      .mockResolvedValueOnce(45)  // saves
      .mockResolvedValueOnce(12); // shares

    const engagement = await service.getPlaceEngagement('place-123', 14);

    expect(engagement).toEqual({
      placeId: 'place-123',
      periodDays: 14,
      views: 300,
      saves: 45,
      shares: 12,
    });
  });
});

