import { Module } from '@nestjs/common';
import { ContentHealthController } from './content-health.controller';
import { ContentHealthService } from './content-health.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [ContentHealthController],
  providers: [ContentHealthService, PrismaService],
  exports: [ContentHealthService],
})
export class ContentHealthModule {}
