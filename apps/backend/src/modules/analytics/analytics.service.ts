import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface TrackEventInput {
  name: string;
  userId?: string;
  placeId?: string;
  bookingId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async track(event: TrackEventInput) {
    return this.prisma.analyticsEvent.create({
      data: {
        name: event.name,
        userId: event.userId,
        placeId: event.placeId,
        bookingId: event.bookingId,
        metadata: JSON.stringify(event.metadata ?? {}),
      },
    });
  }

  async bookingMetrics() {
    const [
      bookings,
      confirmed,
      completed,
      cancelled,
      revenue,
      platformFees,
    ] = await Promise.all([
      this.prisma.booking.count(),

      this.prisma.booking.count({
        where: {
          status: 'CONFIRMED',
        },
      }),

      this.prisma.booking.count({
        where: {
          status: 'COMPLETED',
        },
      }),

      this.prisma.booking.count({
        where: {
          status: 'CANCELLED',
        },
      }),

      this.prisma.booking.aggregate({
        _sum: {
          totalPricePaise: true,
        },
        where: {
          status: {
            in: ['CONFIRMED', 'COMPLETED'],
          },
        },
      }),

      this.prisma.booking.aggregate({
        _sum: {
          platformFeePaise: true,
        },
        where: {
          status: {
            in: ['CONFIRMED', 'COMPLETED'],
          },
        },
      }),
    ]);

    return {
      bookings,
      confirmed,
      completed,
      cancelled,
      grossBookingValuePaise: revenue._sum.totalPricePaise ?? 0,
      platformRevenuePaise: platformFees._sum.platformFeePaise ?? 0,
    };
  }
}
