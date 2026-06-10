import { Controller, Get, Put, Post, Body, Headers, UnauthorizedException, ValidationPipe, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RegisterCreatorDto } from './dto/register-creator.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('User Profile & Creator Registry')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Retrieve authenticated user profile information' })
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @ApiOperation({ summary: 'Update traveler account profile properties' })
  @ApiBody({ type: UpdateProfileDto })
  async updateProfile(
    @Request() req,
    @Body(new ValidationPipe()) dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('creator-registry')
  @ApiOperation({ summary: 'Register traveler account as certified regional content creator' })
  @ApiBody({ type: RegisterCreatorDto })
  async registerCreator(
    @Request() req,
    @Body(new ValidationPipe()) dto: RegisterCreatorDto,
  ) {
    return this.usersService.registerCreator(req.user.id, dto);
  }

  @Get('creators/feed')
  @ApiOperation({ summary: 'Retrieve paginated creator feed' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getCreatorFeed(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '15',
  ) {
    return this.usersService.getCreatorFeed(parseInt(page, 10), parseInt(limit, 10));
  }

  @Get('creators')
  @ApiOperation({ summary: 'Retrieve all verified creator profiles' })
  async getCreators() {
    return this.usersService.getVerifiedCreators();
  }

  @Get('creators/:id')
  @ApiOperation({ summary: 'Retrieve a specific creator profile' })
  async getCreatorProfile(@Param('id') id: string) {
    return this.usersService.getCreatorProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('creators/videos')
  @ApiOperation({ summary: 'Publish native creator video or image post' })
  async createCreatorVideo(
    @Request() req,
    @Body() dto: any,
  ) {
    return this.usersService.createCreatorVideo(req.user.id, dto);
  }
}
