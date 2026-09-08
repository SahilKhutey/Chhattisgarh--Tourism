import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SpatialService } from './spatial.service';
import { SpatialQueryService } from './spatial-query.service';
import { SpatialController } from './spatial.controller';

@Global()
@Module({
  controllers: [SpatialController],
  providers: [PrismaService, SpatialService, SpatialQueryService],
  exports: [PrismaService, SpatialService, SpatialQueryService],
})
export class DatabaseModule {}
