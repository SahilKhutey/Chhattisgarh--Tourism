import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { CreatorStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { OutboxService } from '../outbox/outbox.service';
import { AuditService } from '../audit/audit.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { ApplyCreatorDto } from './dto/apply-creator.dto';
import { CreateContentDto } from './dto/create-content.dto';

@Injectable()
export class CommunityService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly outboxService?: OutboxService,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  // ---------------------------------------------------------------------------
  // COMMENTS
  // ---------------------------------------------------------------------------

  async getComments(videoId: string) {
    const video = await this.prisma.creatorVideo.findUnique({
      where: { id: videoId },
      select: { id: true },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return this.prisma.videoComment.findMany({
      where: { videoId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addComment(userId: string, videoId: string, dto: CreateCommentDto) {
    const video = await this.prisma.creatorVideo.findUnique({
      where: { id: videoId },
      select: { id: true, status: true },
    });

    if (!video || video.status !== 'PUBLISHED') {
      throw new NotFoundException('Published video not found');
    }

    return this.prisma.videoComment.create({
      data: {
        text: dto.text.trim(),
        userId,
        videoId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.videoComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.videoComment.delete({
      where: { id: commentId },
    });

    return { success: true, message: 'Comment deleted' };
  }

  // ---------------------------------------------------------------------------
  // POLLS
  // ---------------------------------------------------------------------------

  async getPolls(videoId: string) {
    const polls = await this.prisma.poll.findMany({
      where: { videoId },
      include: {
        options: true,
        votes: true,
      },
    });

    return polls.map((poll) => {
      const counts: Record<string, number> = {};
      for (const option of poll.options) {
        counts[option.id] = 0;
      }
      for (const vote of poll.votes) {
        if (counts[vote.optionId] !== undefined) {
          counts[vote.optionId]++;
        }
      }

      return {
        id: poll.id,
        question: poll.question,
        options: poll.options.map((option) => ({
          id: option.id,
          text: option.text,
          votes: counts[option.id],
        })),
        totalVotes: poll.votes.length,
      };
    });
  }

  async voteOnPoll(userId: string, pollId: string, optionId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (!poll.options.some((option) => option.id === optionId)) {
      throw new NotFoundException('Poll option not found');
    }

    try {
      await this.prisma.pollVote.create({
        data: {
          userId,
          pollId,
          optionId,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('You have already voted on this poll');
      }
      throw error;
    }

    return { success: true };
  }

  // ---------------------------------------------------------------------------
  // SAVED TRIPS
  // ---------------------------------------------------------------------------

  async saveTrip(userId: string, videoId: string) {
    const video = await this.prisma.creatorVideo.findUnique({
      where: { id: videoId },
      select: { id: true, status: true },
    });

    if (!video || video.status !== 'PUBLISHED') {
      throw new NotFoundException('Published video not found');
    }

    try {
      await this.prisma.savedTrip.create({
        data: {
          userId,
          videoId,
        },
      });
    } catch (error: any) {
      if (error?.code !== 'P2002') {
        throw error;
      }
    }

    return { success: true };
  }

  async unsaveTrip(userId: string, videoId: string) {
    await this.prisma.savedTrip.deleteMany({
      where: {
        userId,
        videoId,
      },
    });

    return { success: true };
  }

  async getSavedTrips(userId: string) {
    const trips = await this.prisma.savedTrip.findMany({
      where: { userId },
      include: {
        video: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return trips.map((trip) => trip.video);
  }

  // ---------------------------------------------------------------------------
  // CREATOR FOLLOWING
  // ---------------------------------------------------------------------------

  async followCreator(userId: string, creatorId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      select: { id: true, verified: true },
    });

    if (!creator || !creator.verified) {
      throw new NotFoundException('Verified creator not found');
    }

    if (await this.isOwnCreatorProfile(userId, creatorId)) {
      throw new ConflictException('You cannot follow your own creator profile');
    }

    try {
      await this.prisma.creatorFollow.create({
        data: {
          userId,
          creatorId,
        },
      });
    } catch (error: any) {
      if (error?.code !== 'P2002') {
        throw error;
      }
    }

    return { success: true, following: true };
  }

  async unfollowCreator(userId: string, creatorId: string) {
    await this.prisma.creatorFollow.deleteMany({
      where: {
        userId,
        creatorId,
      },
    });

    return { success: true, following: false };
  }

  async getFollowing(userId: string) {
    const follows = await this.prisma.creatorFollow.findMany({
      where: { userId },
      include: {
        creator: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return follows.map((follow) => follow.creator);
  }

  async getCreator(creatorId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        videos: {
          where: { status: 'PUBLISHED' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!creator || !creator.verified) {
      throw new NotFoundException('Creator not found');
    }

    return creator;
  }

  async isFollowing(userId: string, creatorId: string) {
    const relation = await this.prisma.creatorFollow.findUnique({
      where: {
        userId_creatorId: {
          userId,
          creatorId,
        },
      },
    });

    return { following: Boolean(relation) };
  }

  private async isOwnCreatorProfile(userId: string, creatorId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      select: { userId: true },
    });

    return creator?.userId === userId;
  }

  // ---------------------------------------------------------------------------
  // CREATOR LIFECYCLE & CONTENT SUBMISSION
  // ---------------------------------------------------------------------------

  async applyCreator(userId: string, dto: ApplyCreatorDto) {
    const existing = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('Creator profile already exists for this user');
    }

    const creator = await this.prisma.creatorProfile.create({
      data: {
        userId,
        bio: dto.bio?.trim() || null,
        district: dto.district?.trim() || 'Unknown',
        categories: dto.specialty ? JSON.stringify([dto.specialty.trim()]) : '[]',
        creatorStatus: 'PENDING',
        verified: false,
      },
    });

    if (this.outboxService) {
      await this.outboxService.recordEvent('CreatorProfile', creator.id, 'CREATOR_APPLIED', {
        userId,
        creatorId: creator.id,
      });
    }

    return creator;
  }

  async verifyCreator(creatorId: string, adminId?: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      throw new NotFoundException('Creator profile not found');
    }

    const updated = await this.prisma.creatorProfile.update({
      where: { id: creatorId },
      data: {
        creatorStatus: 'VERIFIED',
        verified: true,
      },
    });

    if (this.outboxService) {
      await this.outboxService.recordEvent('CreatorProfile', creatorId, 'CREATOR_VERIFIED', {
        creatorId,
        adminId,
      });
    }
    if (this.auditService) {
      await this.auditService.log('CREATOR_VERIFIED', 'CreatorProfile', creatorId, adminId);
    }

    return updated;
  }

  async suspendCreator(creatorId: string, reason: string, adminId?: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      throw new NotFoundException('Creator profile not found');
    }

    const updated = await this.prisma.creatorProfile.update({
      where: { id: creatorId },
      data: {
        creatorStatus: 'SUSPENDED',
        verified: false,
      },
    });

    if (this.auditService) {
      await this.auditService.log('CREATOR_SUSPENDED', 'CreatorProfile', creatorId, adminId, { reason });
    }

    return updated;
  }

  async createVideo(userId: string, dto: CreateVideoDto) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    const isVerified =
      creator &&
      creator.verified === true &&
      ((creator as any).creatorStatus ? (creator as any).creatorStatus === 'VERIFIED' : true);

    if (!isVerified) {
      throw new ForbiddenException(
        'A verified creator profile is required to submit content',
      );
    }

    return this.prisma.creatorVideo.create({
      data: {
        creatorId: creator!.id,
        title: dto.title.trim(),
        location: dto.location.trim(),
        district: dto.district.trim(),
        category: dto.category.trim(),
        language: dto.language.trim(),
        thumbnailUrl: dto.thumbnailUrl,
        videoUrl: dto.videoUrl,
        status: 'PENDING',
      },
    });
  }

  async submitContent(userId: string, dto: CreateContentDto) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    const isVerified =
      creator &&
      creator.verified === true &&
      ((creator as any).creatorStatus ? (creator as any).creatorStatus === 'VERIFIED' : true);

    if (!isVerified) {
      throw new ForbiddenException(
        'A verified creator profile is required to submit content',
      );
    }

    const content = await this.prisma.creatorContent.create({
      data: {
        creatorId: creator.id,
        type: dto.type,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        mediaUrl: dto.mediaUrl || null,
        location: dto.location?.trim() || null,
        placeId: dto.placeId || null,
        language: dto.language ?? 'en',
        status: 'MODERATION',
        moderationStatus: 'PENDING',
      },
    });

    if (this.outboxService) {
      await this.outboxService.recordEvent('CreatorContent', content.id, 'CREATOR_CONTENT_SUBMITTED', {
        contentId: content.id,
        creatorId: creator.id,
      });
    }

    return content;
  }

  // ---------------------------------------------------------------------------
  // CONTENT REPORTING
  // ---------------------------------------------------------------------------

  async reportContent(userId: string, dto: CreateReportDto) {
    await this.assertReportTargetExists(dto.targetType, dto.targetId);

    const existing = await this.prisma.contentReport.findFirst({
      where: {
        reporterId: userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        status: { in: ['OPEN', 'REVIEWING'] },
      },
    });

    if (existing) {
      throw new ConflictException(
        'You already have an active report for this content',
      );
    }

    const report = await this.prisma.contentReport.create({
      data: {
        reporterId: userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason.trim(),
        details: dto.details?.trim(),
      },
    });

    return {
      success: true,
      reportId: report.id,
      status: report.status,
    };
  }

  private async assertReportTargetExists(targetType: string, targetId: string) {
    let exists = false;

    switch (targetType) {
      case 'VIDEO':
        exists = Boolean(
          await this.prisma.creatorVideo.findUnique({
            where: { id: targetId },
            select: { id: true },
          }),
        );
        break;

      case 'COMMENT':
        exists = Boolean(
          await this.prisma.videoComment.findUnique({
            where: { id: targetId },
            select: { id: true },
          }),
        );
        break;

      case 'FOLKLORE':
        exists = Boolean(
          await this.prisma.folklore.findUnique({
            where: { id: targetId },
            select: { id: true },
          }),
        );
        break;

      case 'CREATOR':
        exists = Boolean(
          await this.prisma.creatorProfile.findUnique({
            where: { id: targetId },
            select: { id: true },
          }),
        );
        break;

      default:
        throw new NotFoundException('Unsupported report target');
    }

    if (!exists) {
      throw new NotFoundException('Reported content was not found');
    }
  }
}
