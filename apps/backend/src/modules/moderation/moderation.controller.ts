import {
  Controller, Get, Patch, Delete,
  Param, Body, Query, UseGuards, Req,
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
  async approvePlace(@Param('id') id: string, @Req() req?: any) {
    if (req?.user?.id) {
      return this.moderationService.approvePlace(id, req.user.id);
    }
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

  @Patch('folklore/reject/:id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Reject a folklore submission by setting status to REJECTED' })
  @ApiParam({ name: 'id', type: String })
  async rejectFolklorePatch(@Param('id') id: string) {
    return this.moderationService.rejectFolklore(id);
  }

  @Delete('folklore/reject/:id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Reject a folklore submission' })
  @ApiParam({ name: 'id', type: String })
  async rejectFolklore(@Param('id') id: string) {
    return this.moderationService.rejectFolklore(id);
  }

  // ── Community Moderation ───────────────────────────────────────────────────

  @Get('community/reports')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Retrieve backlog list of open community content reports' })
  async getPendingReports() {
    return this.moderationService.getPendingReports();
  }

  @Patch('community/reports/:id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Update status of a community content report' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ schema: { properties: { status: { type: 'string', example: 'RESOLVED' } } } })
  async updateReport(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.moderationService.updateReport(id, status);
  }

  @Get('community/videos/pending')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Retrieve pending creator videos awaiting moderation' })
  async getPendingVideos() {
    return this.moderationService.getPendingVideos();
  }

  @Patch('community/videos/:id/approve')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Approve and publish a creator video' })
  @ApiParam({ name: 'id', type: String })
  async approveVideo(@Param('id') id: string) {
    return this.moderationService.approveVideo(id);
  }

  @Patch('community/videos/:id/reject')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Reject a creator video submission' })
  @ApiParam({ name: 'id', type: String })
  async rejectVideo(@Param('id') id: string) {
    return this.moderationService.rejectVideo(id);
  }

  // ── Social Media Aggregation ───────────────────────────────────────────────

  @Get('social/pending')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Retrieve backlog list of pending aggregated social media posts' })
  async getPendingSocial() {
    return this.moderationService.getPendingSocial();
  }

  @Patch('social/verify/:id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Verify and publish an aggregated social media post' })
  @ApiParam({ name: 'id', type: String })
  async verifySocial(@Param('id') id: string) {
    return this.moderationService.verifySocial(id);
  }

  @Patch('social/reject/:id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Reject an aggregated social media post' })
  @ApiParam({ name: 'id', type: String })
  async rejectSocial(@Param('id') id: string) {
    return this.moderationService.rejectSocial(id);
  }

  // ── SOS Alerts ─────────────────────────────────────────────────────────────

  @Get('sos-alerts')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Retrieve SOS alert history for rescue coordination' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status: DISPATCHED | RESOLVED | FALSE_ALARM' })
  async getSosAlerts(@Query('status') status?: string) {
    return this.moderationService.getSosAlerts(status);
  }

  // ── Admin Content Removal ──────────────────────────────────────────────────

  @Delete('places/:id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Admin force delete a verified place' })
  @ApiParam({ name: 'id', type: String })
  async deletePlace(@Param('id') id: string) {
    return this.moderationService.deletePlace(id);
  }

  @Delete('creators/:id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Admin force delete a verified creator profile' })
  @ApiParam({ name: 'id', type: String })
  async deleteCreator(@Param('id') id: string) {
    return this.moderationService.deleteCreator(id);
  }
}
