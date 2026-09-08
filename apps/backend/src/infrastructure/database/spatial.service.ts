import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SpatialService {
  constructor(private readonly prisma: PrismaService) {}

  async setEntryLocation(
    entryId: string,
    lat: number,
    lng: number,
  ): Promise<void> {
    if (lat < -90 || lat > 90) {
      throw new Error('Invalid latitude');
    }

    if (lng < -180 || lng > 180) {
      throw new Error('Invalid longitude');
    }

    await this.prisma.$executeRaw`
      UPDATE "ContentEntry"
      SET "location" =
        ST_SetSRID(
          ST_MakePoint(
            ${lng},
            ${lat}
          ),
          4326
        )::geography
      WHERE "id" = ${entryId}
    `;
  }

  async clearEntryLocation(entryId: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE "ContentEntry"
      SET "location" = NULL
      WHERE "id" = ${entryId}
    `;
  }
}
