import { Module } from '@nestjs/common';
import { PublishingService } from './publishing.service';
import { PublishingController } from './publishing.controller';
import { PublishingValidatorService } from './publishing-validator.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [PublishingController],
  providers: [PublishingService, PublishingValidatorService, PrismaService],
  exports: [PublishingService, PublishingValidatorService],
})
export class PublishingModule {}
