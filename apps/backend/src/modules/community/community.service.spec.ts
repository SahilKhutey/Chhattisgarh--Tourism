import { Test, TestingModule } from '@nestjs/testing';
import { CommunityService } from './community.service';
import { PrismaService } from '../../database/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

describe('CommunityService Unit Tests', () => {
  let service: CommunityService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      creatorVideo: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      videoComment: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      poll: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      pollVote: {
        create: jest.fn(),
      },
      savedTrip: {
        findMany: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      creatorProfile: {
        findUnique: jest.fn(),
      },
      creatorFollow: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      contentReport: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      folklore: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<CommunityService>(CommunityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Comments', () => {
    it('getComments should throw NotFoundException when video does not exist', async () => {
      prismaMock.creatorVideo.findUnique.mockResolvedValue(null);
      await expect(service.getComments('nonexistent-vid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('getComments should return comments for valid video', async () => {
      prismaMock.creatorVideo.findUnique.mockResolvedValue({ id: 'vid-1' });
      const mockComments = [
        { id: 'c-1', text: 'Stunning falls!', user: { id: 'u-1', fullName: 'Aman' } },
      ];
      prismaMock.videoComment.findMany.mockResolvedValue(mockComments);

      const result = await service.getComments('vid-1');
      expect(result).toEqual(mockComments);
      expect(prismaMock.videoComment.findMany).toHaveBeenCalledWith({
        where: { videoId: 'vid-1' },
        include: { user: { select: { id: true, fullName: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('addComment should throw NotFoundException if video is not published', async () => {
      prismaMock.creatorVideo.findUnique.mockResolvedValue({
        id: 'vid-1',
        status: 'PENDING',
      });

      await expect(
        service.addComment('u-1', 'vid-1', { text: 'Great place' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('addComment should create comment for published video', async () => {
      prismaMock.creatorVideo.findUnique.mockResolvedValue({
        id: 'vid-1',
        status: 'PUBLISHED',
      });
      const createdComment = { id: 'c-1', text: 'Beautiful Bastar!' };
      prismaMock.videoComment.create.mockResolvedValue(createdComment);

      const result = await service.addComment('u-1', 'vid-1', {
        text: '  Beautiful Bastar!  ',
      });
      expect(result).toEqual(createdComment);
      expect(prismaMock.videoComment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            text: 'Beautiful Bastar!',
            userId: 'u-1',
            videoId: 'vid-1',
          },
        }),
      );
    });

    it('deleteComment should throw ForbiddenException if user is not author', async () => {
      prismaMock.videoComment.findUnique.mockResolvedValue({
        id: 'c-1',
        userId: 'other-user',
      });

      await expect(service.deleteComment('u-1', 'c-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deleteComment should successfully delete comment when requested by author', async () => {
      prismaMock.videoComment.findUnique.mockResolvedValue({
        id: 'c-1',
        userId: 'u-1',
      });
      prismaMock.videoComment.delete.mockResolvedValue({ id: 'c-1' });

      const res = await service.deleteComment('u-1', 'c-1');
      expect(res.success).toBe(true);
      expect(prismaMock.videoComment.delete).toHaveBeenCalledWith({
        where: { id: 'c-1' },
      });
    });
  });

  describe('Creator Follow System', () => {
    it('followCreator should throw NotFoundException if creator is unverified', async () => {
      prismaMock.creatorProfile.findUnique.mockResolvedValue({
        id: 'cr-1',
        verified: false,
      });

      await expect(service.followCreator('u-1', 'cr-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('followCreator should throw ConflictException if following own profile', async () => {
      prismaMock.creatorProfile.findUnique.mockImplementation(() => ({
        id: 'cr-1',
        verified: true,
        userId: 'u-1',
      }));

      await expect(service.followCreator('u-1', 'cr-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('followCreator should successfully create follow relationship', async () => {
      prismaMock.creatorProfile.findUnique.mockImplementation(() => ({
        id: 'cr-1',
        verified: true,
        userId: 'other-user',
      }));
      prismaMock.creatorFollow.create.mockResolvedValue({
        userId: 'u-1',
        creatorId: 'cr-1',
      });

      const res = await service.followCreator('u-1', 'cr-1');
      expect(res).toEqual({ success: true, following: true });
      expect(prismaMock.creatorFollow.create).toHaveBeenCalledWith({
        data: { userId: 'u-1', creatorId: 'cr-1' },
      });
    });

    it('unfollowCreator should delete follow relationship', async () => {
      prismaMock.creatorFollow.deleteMany.mockResolvedValue({ count: 1 });

      const res = await service.unfollowCreator('u-1', 'cr-1');
      expect(res).toEqual({ success: true, following: false });
      expect(prismaMock.creatorFollow.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u-1', creatorId: 'cr-1' },
      });
    });

    it('isFollowing should return status correctly', async () => {
      prismaMock.creatorFollow.findUnique.mockResolvedValue({
        userId: 'u-1',
        creatorId: 'cr-1',
      });

      const res = await service.isFollowing('u-1', 'cr-1');
      expect(res).toEqual({ following: true });
    });
  });

  describe('Creator Video Submission', () => {
    it('createVideo should throw ForbiddenException if user is not verified creator', async () => {
      prismaMock.creatorProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.createVideo('u-1', {
          title: 'Camp at Chitrakote',
          location: 'Chitrakote',
          district: 'Bastar',
          category: 'Adventure',
          language: 'hi',
          thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
          videoUrl: 'https://cdn.example.com/video.mp4',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('createVideo should submit video in PENDING status', async () => {
      prismaMock.creatorProfile.findUnique.mockResolvedValue({
        id: 'cr-1',
        verified: true,
      });
      const createdVideo = {
        id: 'vid-new',
        status: 'PENDING',
        title: 'Camp at Chitrakote',
      };
      prismaMock.creatorVideo.create.mockResolvedValue(createdVideo);

      const result = await service.createVideo('u-1', {
        title: 'Camp at Chitrakote',
        location: 'Chitrakote',
        district: 'Bastar',
        category: 'Adventure',
        language: 'hi',
        thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
        videoUrl: 'https://cdn.example.com/video.mp4',
      });

      expect(result).toEqual(createdVideo);
      expect(prismaMock.creatorVideo.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'PENDING',
          creatorId: 'cr-1',
        }),
      });
    });
  });

  describe('Content Reporting', () => {
    it('reportContent should throw NotFoundException when target does not exist', async () => {
      prismaMock.creatorVideo.findUnique.mockResolvedValue(null);

      await expect(
        service.reportContent('u-1', {
          targetType: 'VIDEO',
          targetId: 'invalid-id',
          reason: 'Spam',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('reportContent should throw ConflictException if user already reported this item', async () => {
      prismaMock.creatorVideo.findUnique.mockResolvedValue({ id: 'vid-1' });
      prismaMock.contentReport.findFirst.mockResolvedValue({
        id: 'rep-1',
        status: 'OPEN',
      });

      await expect(
        service.reportContent('u-1', {
          targetType: 'VIDEO',
          targetId: 'vid-1',
          reason: 'Misleading information',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('reportContent should create report in OPEN status', async () => {
      prismaMock.creatorVideo.findUnique.mockResolvedValue({ id: 'vid-1' });
      prismaMock.contentReport.findFirst.mockResolvedValue(null);
      prismaMock.contentReport.create.mockResolvedValue({
        id: 'rep-new',
        status: 'OPEN',
      });

      const res = await service.reportContent('u-1', {
        targetType: 'VIDEO',
        targetId: 'vid-1',
        reason: 'Inappropriate content',
        details: 'Timestamp 0:15 violates safety guidelines',
      });

      expect(res).toEqual({
        success: true,
        reportId: 'rep-new',
        status: 'OPEN',
      });
    });
  });
});
