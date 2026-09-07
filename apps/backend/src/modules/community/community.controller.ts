import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { CreateVideoDto } from './dto/create-video.dto';

@ApiTags('Community & Social Interactions')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // ---------------------------------------------------------------------------
  // COMMENTS
  // ---------------------------------------------------------------------------

  @Get('videos/:videoId/comments')
  @ApiOperation({ summary: 'List comments for a creator video' })
  async getComments(@Param('videoId') videoId: string) {
    return this.communityService.getComments(videoId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('videos/:videoId/comments')
  @ApiOperation({ summary: 'Add comment to a published video' })
  async addComment(
    @Param('videoId') videoId: string,
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.communityService.addComment(req.user.id, videoId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('comments/:commentId')
  @ApiOperation({ summary: 'Delete own comment' })
  async deleteComment(
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    return this.communityService.deleteComment(req.user.id, commentId);
  }

  // ---------------------------------------------------------------------------
  // POLLS
  // ---------------------------------------------------------------------------

  @Get('videos/:videoId/polls')
  @ApiOperation({ summary: 'Retrieve interactive polls for video' })
  async getPolls(@Param('videoId') videoId: string) {
    return this.communityService.getPolls(videoId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('polls/:pollId/vote')
  @ApiOperation({ summary: 'Vote on a community poll' })
  async voteOnPoll(
    @Param('pollId') pollId: string,
    @Body('optionId') optionId: string,
    @Request() req: any,
  ) {
    return this.communityService.voteOnPoll(req.user.id, pollId, optionId);
  }

  // ---------------------------------------------------------------------------
  // SAVED TRIPS
  // ---------------------------------------------------------------------------

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('videos/:videoId/save-trip')
  @ApiOperation({ summary: 'Save video to personal travel itinerary' })
  async saveTrip(@Param('videoId') videoId: string, @Request() req: any) {
    return this.communityService.saveTrip(req.user.id, videoId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('videos/:videoId/save-trip')
  @ApiOperation({ summary: 'Remove video from personal travel itinerary' })
  async unsaveTrip(@Param('videoId') videoId: string, @Request() req: any) {
    return this.communityService.unsaveTrip(req.user.id, videoId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('saved-trips')
  @ApiOperation({ summary: 'List saved trip videos' })
  async getSavedTrips(@Request() req: any) {
    return this.communityService.getSavedTrips(req.user.id);
  }

  // ---------------------------------------------------------------------------
  // CREATOR
  // ---------------------------------------------------------------------------

  @Get('creators/:creatorId')
  @ApiOperation({ summary: 'Retrieve verified creator profile and published videos' })
  async getCreator(@Param('creatorId') creatorId: string) {
    return this.communityService.getCreator(creatorId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('creators/:creatorId/follow')
  @ApiOperation({ summary: 'Follow a verified creator' })
  async followCreator(
    @Param('creatorId') creatorId: string,
    @Request() req: any,
  ) {
    return this.communityService.followCreator(req.user.id, creatorId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('creators/:creatorId/follow')
  @ApiOperation({ summary: 'Unfollow a creator' })
  async unfollowCreator(
    @Param('creatorId') creatorId: string,
    @Request() req: any,
  ) {
    return this.communityService.unfollowCreator(req.user.id, creatorId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('creators/:creatorId/following')
  @ApiOperation({ summary: 'Check if following a creator' })
  async isFollowing(
    @Param('creatorId') creatorId: string,
    @Request() req: any,
  ) {
    return this.communityService.isFollowing(req.user.id, creatorId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('following')
  @ApiOperation({ summary: 'List all creators followed by current user' })
  async getFollowing(@Request() req: any) {
    return this.communityService.getFollowing(req.user.id);
  }

  // ---------------------------------------------------------------------------
  // CREATOR CONTENT SUBMISSION
  // ---------------------------------------------------------------------------

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('videos')
  @ApiOperation({ summary: 'Submit creator travel video for moderation review' })
  async createVideo(@Body() dto: CreateVideoDto, @Request() req: any) {
    return this.communityService.createVideo(req.user.id, dto);
  }

  // ---------------------------------------------------------------------------
  // REPORTING
  // ---------------------------------------------------------------------------

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('reports')
  @ApiOperation({ summary: 'Submit content safety/accuracy moderation report' })
  async reportContent(@Body() dto: CreateReportDto, @Request() req: any) {
    return this.communityService.reportContent(req.user.id, dto);
  }
}
