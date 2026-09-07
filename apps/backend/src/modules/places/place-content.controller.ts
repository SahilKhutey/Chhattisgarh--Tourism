import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PlaceContentService } from './place-content.service';
import { VerifyPlaceDto } from './dto/verify-place.dto';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

@ApiTags('Place Content Governance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('places/content')
export class PlaceContentController {
  constructor(private readonly contentService: PlaceContentService) {}

  @Get('pending')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({
    summary: 'Retrieve places waiting for content verification',
  })
  async pending() {
    return this.contentService.getPendingPlaces();
  }

  @Get(':id/review')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiParam({ name: 'id' })
  @ApiOperation({
    summary: 'Retrieve complete place data and audit history for review',
  })
  async review(@Param('id') id: string) {
    return this.contentService.getPlaceForReview(id);
  }

  @Patch(':id/verify')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiParam({ name: 'id' })
  @ApiBody({ type: VerifyPlaceDto })
  @ApiOperation({
    summary: 'Verify destination with decision and audit history',
  })
  async verify(
    @Param('id') id: string,
    @Body() dto: VerifyPlaceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!req.user?.id) {
      throw new Error('Authenticated reviewer missing.');
    }

    return this.contentService.verifyPlace(id, req.user.id, dto);
  }

  @Patch(':id/revoke')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiParam({ name: 'id' })
  @ApiOperation({
    summary: 'Revoke verification and return destination to pending review',
  })
  async revoke(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!req.user?.id) {
      throw new Error('Authenticated reviewer missing.');
    }

    return this.contentService.revokeVerification(id, req.user.id, notes);
  }
}
