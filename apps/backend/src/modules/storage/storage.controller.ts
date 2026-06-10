import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Storage & Media')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image or video file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file payload was uploaded.');
    }
    const fileUrl = await this.storageService.saveFile(file);
    return {
      success: true,
      message: 'File uploaded successfully.',
      url: fileUrl,
    };
  }

  @Post('media')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image/video with AI metadata processing and store directly to DB' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        placeId: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        photographer: { type: 'string' },
        creatorHandle: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file payload was uploaded.');
    }
    if (!body.placeId) {
      throw new BadRequestException('placeId is required to upload media.');
    }

    const media = await this.storageService.processAndUploadMedia(file, body.placeId, {
      title: body.title,
      description: body.description,
      photographer: body.photographer,
      creatorHandle: body.creatorHandle,
    });

    return {
      success: true,
      message: 'Media processed and saved.',
      media,
    };
  }
}
