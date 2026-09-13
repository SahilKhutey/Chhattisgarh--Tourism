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

export const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /authorization/i,
  /api[_-]?key/i,
  /credit[_-]?card/i,
  /cvv/i,
  /cvc/i,
  /pin$/i,
  /ssn/i,
  /private[_-]?key/i,
];

export function sanitizeMetadata(metadata: unknown): Record<string, unknown> {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeMetadata(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'object' && item !== null ? sanitizeMetadata(item) : item,
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async track(dto: TrackEventDto | LegacyTrackEventInput) {
    const rawType = (dto.type ?? (dto as any).name ?? 'PAGE_VIEW').toString().toUpperCase();
    const resolvedType = (Object.values(AnalyticsEventType).includes(rawType as AnalyticsEventType)
      ? rawType
      : AnalyticsEventType.PAGE_VIEW) as AnalyticsEventType;

    const sanitizedMeta = sanitizeMetadata(dto.metadata);

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
        metadata: sanitizedMeta as any,
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

  async getDistrictTrends(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const events = await this.prisma.analyticsEvent.groupBy({
      by: ['districtId'],
      where: {
        districtId: { not: null },
        createdAt: { gte: since },
      },
      _count: { _all: true },
    });
    return events
      .map((e) => ({
        districtId: e.districtId!,
        count: e._count._all,
      }))
      .sort((a, b) => b.count - a.count);
  }

  async getPlaceEngagement(placeId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const [views, saves, shares] = await Promise.all([
      this.prisma.analyticsEvent.count({
        where: { placeId, type: AnalyticsEventType.PLACE_VIEW, createdAt: { gte: since } },
      }),
      this.prisma.analyticsEvent.count({
        where: { placeId, type: AnalyticsEventType.SAVE_PLACE, createdAt: { gte: since } },
      }),
      this.prisma.analyticsEvent.count({
        where: { placeId, type: AnalyticsEventType.SHARE_PLACE, createdAt: { gte: since } },
      }),
    ]);
    return { placeId, periodDays: days, views, saves, shares };
  }
}

