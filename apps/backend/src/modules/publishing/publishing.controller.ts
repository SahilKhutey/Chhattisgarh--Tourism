import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { PublishingService } from './publishing.service';

@Controller('api/v1/admin/publishing')
export class PublishingController {
  constructor(private readonly publishingService: PublishingService) {}

  @Post('submit/:placeId')
  async submit(@Param('placeId') placeId: string) {
    const data = await this.publishingService.submit(placeId);
    return {
      data,
      meta: { action: 'SUBMIT_FOR_REVIEW' },
    };
  }

  @Post('publish/:placeId')
  async publish(@Param('placeId') placeId: string) {
    const data = await this.publishingService.publish(placeId);
    return {
      data,
      meta: { action: 'PUBLISH' },
    };
  }

  @Post('archive/:placeId')
  async archive(@Param('placeId') placeId: string) {
    const data = await this.publishingService.archive(placeId);
    return {
      data,
      meta: { action: 'ARCHIVE' },
    };
  }
}
