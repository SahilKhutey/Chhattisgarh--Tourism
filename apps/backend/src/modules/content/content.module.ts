import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { EntryValidatorService } from './validators/entry-validator.service';
import { SlugService } from './slug/slug.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ContentController],
  providers: [
    ContentService,
    EntryValidatorService,
    SlugService,
  ],
  exports: [
    ContentService,
    EntryValidatorService,
    SlugService,
  ],
})
export class ContentModule {}
