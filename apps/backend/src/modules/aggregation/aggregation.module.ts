import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AggregationService } from './aggregation.service';
import { AiProcessorService } from './ai-processor.service';
import { AggregationController } from './aggregation.controller';
import { IntegrationController } from './integration.controller';
import { WebhooksController } from './webhooks.controller';
import { PrismaService } from '../../database/prisma.service';
// In this project it seems PrismaService is typically provided where needed or globally.

@Module({
  imports: [HttpModule],
  controllers: [AggregationController, IntegrationController, WebhooksController],
  providers: [AggregationService, AiProcessorService, PrismaService],
  exports: [AggregationService],
})
export class AggregationModule {}
