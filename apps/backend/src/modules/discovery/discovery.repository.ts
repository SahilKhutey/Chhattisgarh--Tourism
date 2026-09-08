import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DiscoveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(params: {
    q?: string;
    templateId?: string;
    region?: string;
    division?: string;
    district?: string;
    page: number;
    limit: number;
  }) {
    const { q, templateId, region, division, district, page, limit } = params;

    const where: Prisma.ContentSearchIndexWhereInput = {
      entry: {
        status: 'PUBLISHED',
      },
    };

    if (templateId) {
      where.templateId = templateId;
    }

    if (region) {
      where.region = region;
    }

    if (division) {
      where.division = division;
    }

    if (district) {
      where.district = district;
    }

    if (q && q.trim()) {
      const normalized = q.trim();
      where.OR = [
        {
          title: {
            contains: normalized,
            mode: 'insensitive',
          },
        },
        {
          searchableText: {
            contains: normalized,
            mode: 'insensitive',
          },
        },
      ];
    }

    const skip = Math.max(0, (page - 1) * limit);

    const [items, total] = await Promise.all([
      this.prisma.contentSearchIndex.findMany({
        where,
        include: {
          entry: {
            include: {
              template: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.contentSearchIndex.count({
        where,
      }),
    ]);

    return {
      items,
      total,
    };
  }

  async findNearby(lat: number, lng: number, radiusKm: number, limit: number) {
    const safeRadius = Math.max(1, radiusKm);
    const latDelta = safeRadius / 111;
    const cosLat = Math.cos((lat * Math.PI) / 180);
    const lngDelta = safeRadius / (111 * (Math.abs(cosLat) < 0.0001 ? 1 : Math.abs(cosLat)));

    return this.prisma.contentSearchIndex.findMany({
      where: {
        entry: {
          status: 'PUBLISHED',
        },
        lat: {
          gte: lat - latDelta,
          lte: lat + latDelta,
        },
        lng: {
          gte: lng - lngDelta,
          lte: lng + lngDelta,
        },
      },
      include: {
        entry: {
          include: {
            template: true,
          },
        },
      },
      take: limit,
    });
  }

  async findInBounds(north: number, south: number, east: number, west: number, limit: number) {
    return this.prisma.contentSearchIndex.findMany({
      where: {
        entry: {
          status: 'PUBLISHED',
        },
        lat: {
          gte: south,
          lte: north,
        },
        lng: {
          gte: west,
          lte: east,
        },
      },
      include: {
        entry: {
          include: {
            template: true,
          },
        },
      },
      take: limit,
    });
  }
}
