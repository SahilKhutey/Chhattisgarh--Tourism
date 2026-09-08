import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TrackEventDto } from './dto/track-event.dto';
import { AnalyticsEventType } from './types/analytics-event.type';

export interface LegacyTrackEventInput {
  name?: string;
  type?: AnalyticsEventType;
  userId?: string;
  placeId?: string;
  districtId?: string;
  bookingId?: string;
  sessionId?: string;
  latitude?: number;
  longitude?: number;
  language?: string;
  platform?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async track(dto: TrackEventDto | LegacyTrackEventInput) {
    const rawType = (dto.type ?? (dto as any).name ?? 'PAGE_VIEW').toString().toUpperCase();
    const resolvedType = (Object.values(AnalyticsEventType).includes(rawType as AnalyticsEventType)
      ? rawType
      : AnalyticsEventType.PAGE_VIEW) as AnalyticsEventType;

    return this.prisma.analyticsEvent.create({
      data: {
        type: resolvedType,
        name: (dto as any).name ?? resolvedType,
        userId: dto.userId,
        placeId: dto.placeId,
        districtId: dto.districtId,
        bookingId: (dto as any).bookingId,
        sessionId: dto.sessionId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        language: dto.language,
        platform: dto.platform,
        metadata: (dto.metadata as any) ?? {},
      },
    });
  }

  async countByType(from: Date, to: Date) {
    return this.prisma.analyticsEvent.groupBy({
      by: ['type'],
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      _count: {
        _all: true,
      },
    });
  }

  async placeViews(placeId: string, from: Date, to: Date) {
    return this.prisma.analyticsEvent.count({
      where: {
        placeId,
        type: AnalyticsEventType.PLACE_VIEW,
        createdAt: {
          gte: from,
          lte: to,
        },
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
