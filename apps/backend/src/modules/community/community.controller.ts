import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CommunityService } from './community.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('v1/community')
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly prisma: PrismaService
  ) {}

  // --- Comments ---
  
  @Get('videos/:videoId/comments')
  async getComments(@Param('videoId') videoId: string) {
    return this.communityService.getComments(videoId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('videos/:videoId/comments')
  async addComment(
    @Param('videoId') videoId: string,
    @Body('text') text: string,
    @Request() req
  ) {
    return this.communityService.addComment(req.user.id, videoId, text);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @Request() req
  ) {
    return this.communityService.deleteComment(req.user.id, commentId);
  }

  // --- Polls ---

  @Get('videos/:videoId/polls')
  async getPolls(@Param('videoId') videoId: string) {
    return this.communityService.getPolls(videoId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('polls/:pollId/vote')
  async voteOnPoll(
    @Param('pollId') pollId: string,
    @Body('optionId') optionId: string,
    @Request() req
  ) {
    return this.communityService.voteOnPoll(req.user.id, pollId, optionId);
  }

  // --- Saved Trips (Plan Your Trip) ---

  @UseGuards(JwtAuthGuard)
  @Post('videos/:videoId/save-trip')
  async saveTrip(
    @Param('videoId') videoId: string,
    @Request() req
  ) {
    return this.communityService.saveTrip(req.user.id, videoId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('videos/:videoId/save-trip')
  async unsaveTrip(
    @Param('videoId') videoId: string,
    @Request() req
  ) {
    return this.communityService.unsaveTrip(req.user.id, videoId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('saved-trips')
  async getSavedTrips(@Request() req) {
    return this.communityService.getSavedTrips(req.user.id);
  }
}
