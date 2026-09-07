import { Module } from '@nestjs/common';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { PrismaService } from '../../database/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { PlacesModule } from '../places/places.module';

@Module({
  imports: [AuthModule, PlacesModule],
  controllers: [ModerationController],
  providers: [ModerationService, PrismaService],
})
export class ModerationModule {}

