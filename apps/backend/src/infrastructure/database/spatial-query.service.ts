import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SpatialQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findNearby(
    lat: number,
    lng: number,
    radiusMeters: number,
  ) {
    if (lat < -90 || lat > 90) {
      throw new Error('Invalid latitude');
    }

    if (lng < -180 || lng > 180) {
      throw new Error('Invalid longitude');
    }

    if (radiusMeters <= 0) {
      throw new Error('Radius must be positive');
    }

    return this.prisma.$queryRaw`
      SELECT
        ce.*,
        ST_Distance(
          ce."location",
          ST_SetSRID(
            ST_MakePoint(
              ${lng},
              ${lat}
            ),
            4326
          )::geography
        ) AS distance_meters
      FROM "ContentEntry" ce
      WHERE
        ce."status" = 'PUBLISHED'
        AND ce."location" IS NOT NULL
        AND ST_DWithin(
          ce."location",
          ST_SetSRID(
            ST_MakePoint(
              ${lng},
              ${lat}
            ),
            4326
          )::geography,
          ${radiusMeters}
        )
      ORDER BY distance_meters ASC
    `;
  }
}
