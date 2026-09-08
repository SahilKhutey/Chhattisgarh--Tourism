import { Module } from '@nestjs/common';
import { ContentTemplatesController } from './content-templates.controller';
import { ContentTemplatesService } from './content-templates.service';
import { TemplateValidatorService } from './template-validator.service';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

@Module({
  controllers: [ContentTemplatesController],
  providers: [
    ContentTemplatesService,
    TemplateValidatorService,
    PrismaService,
    RedisService,
  ],
  exports: [ContentTemplatesService, TemplateValidatorService],
})
export class ContentTemplatesModule {}
