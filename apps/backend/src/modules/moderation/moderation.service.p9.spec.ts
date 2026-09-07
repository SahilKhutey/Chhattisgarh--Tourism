import { Test, TestingModule } from '@nestjs/testing';
import { ModerationService } from './moderation.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ModerationService P9 Community & Folklore Queues', () => {
  let service: ModerationService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      folklore: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      contentReport: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      creatorVideo: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModerationService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ModerationService>(ModerationService);
  });

  describe('Folklore Moderation', () => {
    it('verifyFolklore should update folklore to verified: true and status: APPROVED', async () => {
      prismaMock.folklore.findUnique.mockResolvedValue({ id: 'f-1', title: 'Ancient Tale' });
      prismaMock.folklore.update.mockResolvedValue({ id: 'f-1', verified: true, status: 'APPROVED' });

      const res = await service.verifyFolklore('f-1');

      expect(res.success).toBe(true);
      expect(prismaMock.folklore.update).toHaveBeenCalledWith({
        where: { id: 'f-1' },
        data: { verified: true, status: 'APPROVED' },
      });
    });

    it('rejectFolklore should preserve audit record by updating status to REJECTED instead of deleting', async () => {
      prismaMock.folklore.findUnique.mockResolvedValue({ id: 'f-1', title: 'Incomplete Tale' });
      prismaMock.folklore.update.mockResolvedValue({ id: 'f-1', verified: false, status: 'REJECTED' });

      const res = await service.rejectFolklore('f-1');

      expect(res.success).toBe(true);
      expect(prismaMock.folklore.update).toHaveBeenCalledWith({
        where: { id: 'f-1' },
        data: { verified: false, status: 'REJECTED' },
      });
    });
  });

  describe('Content Reports Queue', () => {
    it('getPendingReports should return OPEN reports with reporter info', async () => {
      const mockReports = [
        {
          id: 'rep-1',
          targetType: 'VIDEO',
          targetId: 'vid-1',
          reason: 'Spam',
          status: 'OPEN',
          reporter: { id: 'u-1', fullName: 'Pooja', email: 'pooja@example.com' },
        },
      ];
      prismaMock.contentReport.findMany.mockResolvedValue(mockReports);

      const result = await service.getPendingReports();

      expect(result).toEqual(mockReports);
      expect(prismaMock.contentReport.findMany).toHaveBeenCalledWith({
        where: { status: 'OPEN' },
        include: {
          reporter: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('updateReport should update report status', async () => {
      prismaMock.contentReport.findUnique.mockResolvedValue({ id: 'rep-1', status: 'OPEN' });
      prismaMock.contentReport.update.mockResolvedValue({ id: 'rep-1', status: 'RESOLVED' });

      const res = await service.updateReport('rep-1', 'RESOLVED');

      expect(res.success).toBe(true);
      expect(prismaMock.contentReport.update).toHaveBeenCalledWith({
        where: { id: 'rep-1' },
        data: { status: 'RESOLVED' },
      });
    });
  });

  describe('Creator Video Queue', () => {
    it('getPendingVideos should return videos with status PENDING', async () => {
      const mockVideos = [
        {
          id: 'v-1',
          title: 'Mainpat Hills Tour',
          status: 'PENDING',
          creator: { user: { fullName: 'Rahul' } },
        },
      ];
      prismaMock.creatorVideo.findMany.mockResolvedValue(mockVideos);

      const result = await service.getPendingVideos();

      expect(result).toEqual(mockVideos);
      expect(prismaMock.creatorVideo.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        include: {
          creator: {
            include: { user: { select: { fullName: true, email: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('approveVideo should update video status to PUBLISHED', async () => {
      prismaMock.creatorVideo.findUnique.mockResolvedValue({ id: 'v-1', status: 'PENDING' });
      prismaMock.creatorVideo.update.mockResolvedValue({ id: 'v-1', status: 'PUBLISHED' });

      const res = await service.approveVideo('v-1');

      expect(res.success).toBe(true);
      expect(prismaMock.creatorVideo.update).toHaveBeenCalledWith({
        where: { id: 'v-1' },
        data: { status: 'PUBLISHED' },
      });
    });

    it('rejectVideo should update video status to REJECTED', async () => {
      prismaMock.creatorVideo.findUnique.mockResolvedValue({ id: 'v-1', status: 'PENDING' });
      prismaMock.creatorVideo.update.mockResolvedValue({ id: 'v-1', status: 'REJECTED' });

      const res = await service.rejectVideo('v-1');

      expect(res.success).toBe(true);
      expect(prismaMock.creatorVideo.update).toHaveBeenCalledWith({
        where: { id: 'v-1' },
        data: { status: 'REJECTED' },
      });
    });
  });
});
