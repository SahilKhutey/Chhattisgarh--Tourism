import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Comments ---

  async getComments(videoId: string) {
    return this.prisma.videoComment.findMany({
      where: { videoId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addComment(userId: string, videoId: string, text: string) {
    return this.prisma.videoComment.create({
      data: {
        text,
        userId,
        videoId
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          }
        }
      }
    });
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.videoComment.findUnique({
      where: { id: commentId }
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new ForbiddenException('You can only delete your own comments');

    await this.prisma.videoComment.delete({
      where: { id: commentId }
    });
    return { success: true };
  }

  // --- Polls ---

  async getPolls(videoId: string) {
    const polls = await this.prisma.poll.findMany({
      where: { videoId },
      include: {
        options: true,
        votes: true
      }
    });

    // Format polls to include vote counts
    return polls.map(poll => {
      const optionCounts = {};
      poll.options.forEach(opt => optionCounts[opt.id] = 0);
      poll.votes.forEach(vote => {
        if (optionCounts[vote.optionId] !== undefined) {
          optionCounts[vote.optionId]++;
        }
      });
      return {
        id: poll.id,
        question: poll.question,
        options: poll.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          votes: optionCounts[opt.id]
        })),
        totalVotes: poll.votes.length
      };
    });
  }

  async voteOnPoll(userId: string, pollId: string, optionId: string) {
    try {
      await this.prisma.pollVote.create({
        data: {
          userId,
          pollId,
          optionId
        }
      });
      return { success: true };
    } catch (e) {
      if (e.code === 'P2002') {
        throw new ConflictException('You have already voted on this poll');
      }
      throw e;
    }
  }

  // --- Saved Trips ---

  async saveTrip(userId: string, videoId: string) {
    try {
      await this.prisma.savedTrip.create({
        data: {
          userId,
          videoId
        }
      });
      return { success: true };
    } catch (e) {
       if (e.code === 'P2002') return { success: true }; // Already saved
       throw e;
    }
  }

  async unsaveTrip(userId: string, videoId: string) {
    try {
      await this.prisma.savedTrip.delete({
        where: {
          userId_videoId: {
            userId,
            videoId
          }
        }
      });
      return { success: true };
    } catch (e) {
      return { success: true }; // Ignore if not found
    }
  }

  async getSavedTrips(userId: string) {
    const trips = await this.prisma.savedTrip.findMany({
      where: { userId },
      include: {
        video: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return trips.map(t => t.video);
  }
}
