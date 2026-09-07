import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FolkloreService } from './folklore.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateFolkloreDto } from '../community/dto/create-folklore.dto';

@ApiTags('Folklore')
@Controller('folklore')
export class FolkloreController {
  constructor(private readonly folkloreService: FolkloreService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit folklore for moderation' })
  async createFolklore(@Body() data: CreateFolkloreDto, @Request() req: any) {
    return this.folkloreService.createFolklore(data, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve approved folklore' })
  async getVerifiedFolklore() {
    return this.folkloreService.getVerifiedFolklore();
  }
}
