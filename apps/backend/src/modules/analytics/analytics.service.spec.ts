import { AnalyticsService } from './analytics.service';

describe('AnalyticsService Unit Tests', () => {
  let service: AnalyticsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      analyticsEvent: {
        create: jest.fn(),
      },
      booking: {
        count: jest.fn(),
        aggregate: jest.fn(),
      },
    };

    service = new AnalyticsService(prisma);
  });

  it('tracks an event with JSON metadata', async () => {
    prisma.analyticsEvent.create.mockResolvedValue({
      id: 'event-id',
      name: 'booking_created',
    });

    const result = await service.track({
      name: 'booking_created',
      userId: 'user-id',
      placeId: 'place-id',
      bookingId: 'booking-id',
      metadata: {
        guests: 2,
      },
    });

    expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({
      data: {
        name: 'booking_created',
        userId: 'user-id',
        placeId: 'place-id',
        bookingId: 'booking-id',
        metadata: JSON.stringify({
          guests: 2,
        }),
      },
    });

    expect(result.id).toBe('event-id');
  });

  it('returns booking monetization metrics and revenue aggregations', async () => {
    prisma.booking.count
      .mockResolvedValueOnce(100) // total
      .mockResolvedValueOnce(20)  // confirmed
      .mockResolvedValueOnce(60)  // completed
      .mockResolvedValueOnce(20); // cancelled

    prisma.booking.aggregate
      .mockResolvedValueOnce({
        _sum: {
          totalPricePaise: 5000000,
        },
      })
      .mockResolvedValueOnce({
        _sum: {
          platformFeePaise: 250000,
        },
      });

    const result = await service.bookingMetrics();

    expect(result.bookings).toBe(100);
    expect(result.confirmed).toBe(20);
    expect(result.completed).toBe(60);
    expect(result.cancelled).toBe(20);
    expect(result.grossBookingValuePaise).toBe(5000000);
    expect(result.platformRevenuePaise).toBe(250000);
  });
});
