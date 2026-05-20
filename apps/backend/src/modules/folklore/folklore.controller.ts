import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FolkloreService } from './folklore.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Folklore')
@Controller('folklore')
export class FolkloreController {
  constructor(private readonly folkloreService: FolkloreService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a new folklore story for verification' })
  async createFolklore(@Body() data: any, @Request() req: any) {
    return this.folkloreService.createFolklore(data, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all verified folklore stories' })
  async getVerifiedFolklore() {
    return this.folkloreService.getVerifiedFolklore();
  }
}
