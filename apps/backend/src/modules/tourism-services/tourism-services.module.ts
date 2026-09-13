import { Module } from '@nestjs/common';
import { TourismServicesService } from './tourism-services.service';
import { TourismServicesController } from './tourism-services.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [TourismServicesController],
  providers: [TourismServicesService, PrismaService],
  exports: [TourismServicesService],
})
export class TourismServicesModule {}
