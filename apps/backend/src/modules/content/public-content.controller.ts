import {
  Controller,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('public/content')
export class PublicContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get(':templateSlug/:entrySlug')
  async getContent(
    @Param('templateSlug') templateSlug: string,
    @Param('entrySlug') entrySlug: string,
  ) {
    const entry = await this.contentService.findPublicBySlug(
      templateSlug,
      entrySlug,
    );

    if (!entry) {
      throw new NotFoundException('Content not found');
    }

    return {
      id: entry.id,
      title: this.extractTitle(entry.data),
      slug: entry.slug,
      data: entry.data,
      region: entry.region,
      division: entry.division,
      district: entry.district,
      latitude: entry.latitude,
      longitude: entry.longitude,
      publishedAt: entry.publishedAt,
      template: {
        id: entry.template.id,
        name: entry.template.name,
        slug: entry.template.slug,
        version: entry.template.version,
        fields: entry.template.fields,
      },
    };
  }

  private extractTitle(data: unknown): string {
    if (!data || typeof data !== 'object') {
      return 'Untitled';
    }

    const object = data as Record<string, unknown>;
    const title = object.title ?? object.name;

    return typeof title === 'string' ? title : 'Untitled';
  }
}
