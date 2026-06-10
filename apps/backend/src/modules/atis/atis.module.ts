import { Module } from '@nestjs/common';
import { DiscoveryEngineService } from './services/discovery-engine.service';
import { HealthEngineService } from './services/health-engine.service';
import { MediaUnderstandingEngineService } from './services/media-understanding-engine.service';
import { VerificationEngineService } from './services/verification-engine.service';
import { PrismaService } from '../../database/prisma.service';
import { StorageModule } from '../storage/storage.module';
import { AtisController } from './atis.controller';

@Module({
  imports: [StorageModule],
  controllers: [AtisController],
  providers: [
    PrismaService,
    DiscoveryEngineService,
    HealthEngineService,
    MediaUnderstandingEngineService,
    VerificationEngineService,
  ],
  exports: [
    VerificationEngineService,
    MediaUnderstandingEngineService
  ],
})
export class AtisModule {}
