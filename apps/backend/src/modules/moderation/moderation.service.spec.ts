import { Test, TestingModule } from '@nestjs/testing';
import { ModerationService } from './moderation.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ModerationService Unit Tests', () => {
  let service: ModerationService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      place: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
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

  it('should be successfully initialized', () => {
    expect(service).toBeDefined();
  });

  describe('getPendingPlaces operations tests', () => {
    it('should return chronological list of unverified creator coordinates submissions', async () => {
      const mockPendingFeed = [
        { id: 'p-1', name: 'Pending Chitrakote Trails', verified: false, createdAt: new Date() },
      ];
      prismaMock.place.findMany.mockResolvedValue(mockPendingFeed);

      const result = await service.getPendingPlaces();

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Pending Chitrakote Trails');
      expect(prismaMock.place.findMany).toHaveBeenCalled();
    });
  });

  describe('approvePlace operations tests', () => {
    it('should throw NotFoundException if targeted place ID does not exist in PostgreSQL', async () => {
      prismaMock.place.findUnique.mockResolvedValue(null);
      await expect(service.approvePlace('invalid-place-uuid')).rejects.toThrow(NotFoundException);
    });

    it('should successfully update place verified flag to true and publish coordinates', async () => {
      prismaMock.place.findUnique.mockResolvedValue({ id: 'valid-place-uuid', name: 'Chitrakote' });
      prismaMock.place.update.mockResolvedValue({ id: 'valid-place-uuid', name: 'Chitrakote', verified: true });

      const result = await service.approvePlace('valid-place-uuid');

      expect(result.success).toBe(true);
      expect(result.message).toContain('verified and added to active discovery maps');
      expect(prismaMock.place.update).toHaveBeenCalled();
    });
  });

  describe('rejectPlace operations tests', () => {
    it('should throw NotFoundException if targeted place ID does not exist in PostgreSQL', async () => {
      prismaMock.place.findUnique.mockResolvedValue(null);
      await expect(service.rejectPlace('invalid-place-uuid')).rejects.toThrow(NotFoundException);
    });

    it('should delete rejected coordinates node from PostgreSQL backlog successfully', async () => {
      prismaMock.place.findUnique.mockResolvedValue({ id: 'valid-place-uuid', name: 'Chitrakote' });
      prismaMock.place.delete.mockResolvedValue({ id: 'valid-place-uuid' });

      const result = await service.rejectPlace('valid-place-uuid');

      expect(result.success).toBe(true);
      expect(result.message).toContain('rejected and deleted from backlog successfully');
      expect(prismaMock.place.delete).toHaveBeenCalled();
    });
  });
});
