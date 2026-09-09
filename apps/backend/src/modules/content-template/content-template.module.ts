import { Module } from '@nestjs/common';
import { ContentTemplateController } from './content-template.controller';
import { ContentTemplateService } from './content-template.service';
import { ContentEntryController } from './content-entry.controller';
import { ContentEntryService } from './content-entry.service';
import { TemplateAccessService } from './template-access.service';
import { TemplateDriftScheduler } from './template-drift.scheduler';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [
    ContentTemplateController,
    ContentEntryController,
  ],
  providers: [
    PrismaService,
    ContentTemplateService,
    ContentEntryService,
    TemplateAccessService,
    TemplateDriftScheduler,
  ],
  exports: [
    ContentTemplateService,
    ContentEntryService,
    TemplateAccessService,
  ],
})
export class ContentTemplateModule {}
