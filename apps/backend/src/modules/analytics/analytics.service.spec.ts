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
});
