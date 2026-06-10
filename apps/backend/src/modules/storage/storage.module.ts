import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { AIService } from './ai.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [StorageController],
  providers: [StorageService, AIService, PrismaService],
  exports: [StorageService, AIService],
})
export class StorageModule {}
