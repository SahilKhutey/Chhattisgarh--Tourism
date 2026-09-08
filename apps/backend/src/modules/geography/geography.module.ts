import { Module } from '@nestjs/common';
import { GeographyController } from './geography.controller';
import { GeographyService } from './geography.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [GeographyController],
  providers: [GeographyService, PrismaService],
  exports: [GeographyService],
})
export class GeographyModule {}
