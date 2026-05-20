import { Controller, Get, Put, Post, Body, Headers, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RegisterCreatorDto } from './dto/register-creator.dto';

@ApiTags('User Profile & Creator Registry')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Retrieve authenticated user profile information' })
  @ApiHeader({ name: 'x-user-id', required: true, description: 'Simulated authorized User ID' })
  async getProfile(@Headers('x-user-id') userId: string) {
    this.checkUserAuth(userId);
    return this.usersService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update traveler account profile properties' })
  @ApiHeader({ name: 'x-user-id', required: true, description: 'Simulated authorized User ID' })
  @ApiBody({ type: UpdateProfileDto })
  async updateProfile(
    @Headers('x-user-id') userId: string,
    @Body(new ValidationPipe()) dto: UpdateProfileDto,
  ) {
    this.checkUserAuth(userId);
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('creator-registry')
  @ApiOperation({ summary: 'Register traveler account as certified regional content creator' })
  @ApiHeader({ name: 'x-user-id', required: true, description: 'Simulated authorized User ID' })
  @ApiBody({ type: RegisterCreatorDto })
  async registerCreator(
    @Headers('x-user-id') userId: string,
    @Body(new ValidationPipe()) dto: RegisterCreatorDto,
  ) {
    this.checkUserAuth(userId);
    return this.usersService.registerCreator(userId, dto);
  }

  private checkUserAuth(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authorization header x-user-id is required to access profile APIs.');
    }
  }
}
