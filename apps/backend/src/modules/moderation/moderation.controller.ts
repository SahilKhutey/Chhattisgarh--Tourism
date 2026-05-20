import { Controller, Get, Patch, Delete, Param, Headers, UnauthorizedException, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiParam, ApiBody } from '@nestjs/swagger';
import { ModerationService } from './moderation.service';

@ApiTags('Admin Content Moderation')
@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('users')
  @ApiOperation({ summary: 'Retrieve all registered users for role assignment' })
  @ApiHeader({ name: 'x-admin-role', required: true, description: 'Simulated security role validation' })
  async getUsers(@Headers('x-admin-role') role: string) {
    this.checkAdminPrivileges(role);
    return this.moderationService.getUsers();
  }

  @Patch('appoint/:userId')
  @ApiOperation({ summary: 'Change user role (e.g. appoint as ADMIN or MODERATOR)' })
  @ApiHeader({ name: 'x-admin-role', required: true, description: 'Simulated security role validation' })
  @ApiParam({ name: 'userId', type: String })
  @ApiBody({ schema: { properties: { role: { type: 'string' } } } })
  async appointRole(
    @Headers('x-admin-role') currentRole: string,
    @Param('userId') userId: string,
    @Body('role') newRole: any,
  ) {
    this.checkAdminPrivileges(currentRole);
    return this.moderationService.appointRole(userId, newRole);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Retrieve backlog list of all unverified creator places submissions' })
  @ApiHeader({ name: 'x-admin-role', required: true, description: 'Simulated security role validation' })
  async getPendingPlaces(@Headers('x-admin-role') role: string) {
    this.checkAdminPrivileges(role);
    return this.moderationService.getPendingPlaces();
  }

  @Patch('approve/:id')
  @ApiOperation({ summary: 'Approve pending destination, setting verified to true' })
  @ApiHeader({ name: 'x-admin-role', required: true, description: 'Simulated security role validation' })
  @ApiParam({ name: 'id', type: String, description: 'Pending destination ID' })
  async approvePlace(
    @Headers('x-admin-role') role: string,
    @Param('id') id: string,
  ) {
    this.checkAdminPrivileges(role);
    return this.moderationService.approvePlace(id);
  }

  @Delete('reject/:id')
  @ApiOperation({ summary: 'Reject and delete pending destination submission' })
  @ApiHeader({ name: 'x-admin-role', required: true, description: 'Simulated security role validation' })
  @ApiParam({ name: 'id', type: String, description: 'Pending destination ID' })
  async rejectPlace(
    @Headers('x-admin-role') role: string,
    @Param('id') id: string,
  ) {
    this.checkAdminPrivileges(role);
    return this.moderationService.rejectPlace(id);
  }

  @Get('creators/pending')
  @ApiOperation({ summary: 'Retrieve backlog list of unverified creator profiles' })
  @ApiHeader({ name: 'x-admin-role', required: true, description: 'Simulated security role validation' })
  async getPendingCreators(@Headers('x-admin-role') role: string) {
    this.checkAdminPrivileges(role);
    return this.moderationService.getPendingCreators();
  }

  @Patch('creators/verify/:id')
  @ApiOperation({ summary: 'Verify a pending creator profile' })
  @ApiHeader({ name: 'x-admin-role', required: true, description: 'Simulated security role validation' })
  @ApiParam({ name: 'id', type: String, description: 'CreatorProfile ID' })
  async verifyCreator(
    @Headers('x-admin-role') role: string,
    @Param('id') id: string,
  ) {
    this.checkAdminPrivileges(role);
    return this.moderationService.verifyCreator(id);
  }

  @Get('folklore/pending')
  @ApiOperation({ summary: 'Retrieve backlog list of unverified folklore' })
  @ApiHeader({ name: 'x-admin-role', required: true })
  async getPendingFolklore(@Headers('x-admin-role') role: string) {
    this.checkAdminPrivileges(role);
    return this.moderationService.getPendingFolklore();
  }

  @Patch('folklore/verify/:id')
  @ApiOperation({ summary: 'Verify a pending folklore' })
  @ApiHeader({ name: 'x-admin-role', required: true })
  @ApiParam({ name: 'id', type: String })
  async verifyFolklore(
    @Headers('x-admin-role') role: string,
    @Param('id') id: string,
  ) {
    this.checkAdminPrivileges(role);
    return this.moderationService.verifyFolklore(id);
  }

  @Delete('folklore/reject/:id')
  @ApiOperation({ summary: 'Reject and delete a pending folklore' })
  @ApiHeader({ name: 'x-admin-role', required: true })
  @ApiParam({ name: 'id', type: String })
  async rejectFolklore(
    @Headers('x-admin-role') role: string,
    @Param('id') id: string,
  ) {
    this.checkAdminPrivileges(role);
    return this.moderationService.rejectFolklore(id);
  }

  private checkAdminPrivileges(role: string) {
    if (!role || (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && role !== 'MODERATOR')) {
      throw new UnauthorizedException('Access denied. Administrator or Moderator privileges are required.');
    }
  }
}

