import {
  Controller, Get, Patch, Delete,
  Param, Body, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiParam,
  ApiBody, ApiBearerAuth, ApiQuery,
} from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

/**
 * All routes in this controller require:
 *  1. A valid JWT Bearer token  (JwtAuthGuard)
 *  2. The appropriate role       (RolesGuard + @Roles())
 *
 * The old x-admin-role header has been fully removed — it was trivially bypassable.
 */
@ApiTags('Admin Content Moderation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  // ── Users ──────────────────────────────────────────────────────────────────

  @Get('users')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Retrieve all registered users for role assignment' })
  async getUsers() {
    return this.moderationService.getUsers();
  }

  @Patch('appoint/:userId')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Change user role (e.g. appoint as ADMIN or MODERATOR)' })
  @ApiParam({ name: 'userId', type: String })
  @ApiBody({ schema: { properties: { role: { type: 'string' } } } })
  async appointRole(
    @Param('userId') userId: string,
    @Body('role') newRole: string,
  ) {
    return this.moderationService.appointRole(userId, newRole);
  }

  // ── Places ─────────────────────────────────────────────────────────────────

  @Get('pending')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Retrieve backlog list of all unverified creator places' })
  async getPendingPlaces() {
    return this.moderationService.getPendingPlaces();
  }

  @Patch('approve/:id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Approve pending destination — sets verified to true' })
  @ApiParam({ name: 'id', type: String, description: 'Pending destination ID' })
  async approvePlace(@Param('id') id: string) {
    return this.moderationService.approvePlace(id);
  }

  @Delete('reject/:id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Reject and delete a pending destination submission' })
  @ApiParam({ name: 'id', type: String, description: 'Pending destination ID' })
  async rejectPlace(@Param('id') id: string) {
    return this.moderationService.rejectPlace(id);
  }

  // ── Creators ───────────────────────────────────────────────────────────────

  @Get('creators/pending')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Retrieve backlog list of unverified creator profiles' })
  async getPendingCreators() {
    return this.moderationService.getPendingCreators();
  }

  @Patch('creators/verify/:id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Verify a pending creator profile — promotes user role to CREATOR' })
  @ApiParam({ name: 'id', type: String, description: 'CreatorProfile ID' })
  async verifyCreator(@Param('id') id: string) {
    return this.moderationService.verifyCreator(id);
  }

  // ── Folklore ───────────────────────────────────────────────────────────────

  @Get('folklore/pending')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Retrieve backlog list of unverified folklore submissions' })
  async getPendingFolklore() {
    return this.moderationService.getPendingFolklore();
  }

  @Patch('folklore/verify/:id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Verify and publish a pending folklore entry' })
  @ApiParam({ name: 'id', type: String })
  async verifyFolklore(@Param('id') id: string) {
    return this.moderationService.verifyFolklore(id);
  }

  @Delete('folklore/reject/:id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Reject and permanently delete a folklore submission' })
  @ApiParam({ name: 'id', type: String })
  async rejectFolklore(@Param('id') id: string) {
    return this.moderationService.rejectFolklore(id);
  }

  // ── SOS Alerts ─────────────────────────────────────────────────────────────

  @Get('sos-alerts')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Retrieve SOS alert history for rescue coordination' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status: DISPATCHED | RESOLVED | FALSE_ALARM' })
  async getSosAlerts(@Query('status') status?: string) {
    return this.moderationService.getSosAlerts(status);
  }
}
