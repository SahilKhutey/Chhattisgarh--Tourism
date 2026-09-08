import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('health/spatial')
export class SpatialController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      const result = await this.prisma.$queryRaw<
        Array<{
          postgis_version: string;
        }>
      >`
        SELECT PostGIS_Version() AS postgis_version
      `;

      return {
        postgis: result[0]?.postgis_version ?? null,
      };
    } catch {
      return {
        postgis: null,
      };
    }
  }
}
