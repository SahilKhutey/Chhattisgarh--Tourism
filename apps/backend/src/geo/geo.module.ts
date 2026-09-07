import { Module } from '@nestjs/common';
import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';
import { GeoRepository } from './geo.repository';
import { DistanceService } from './services/distance.service';
import { BoundaryService } from './services/boundary.service';
import { RoutingService } from './services/routing.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  controllers: [GeoController],
  providers: [
    GeoService,
    GeoRepository,
    DistanceService,
    BoundaryService,
    RoutingService,
    PrismaService,
  ],
  exports: [
    GeoService,
    GeoRepository,
    DistanceService,
    BoundaryService,
    RoutingService,
  ],
})
export class GeoModule {}
