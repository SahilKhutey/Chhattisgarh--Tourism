import { Test, TestingModule } from '@nestjs/testing';
import { PlaceContentService } from './place-content.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PlaceContentService Unit Tests', () => {
  let service: PlaceContentService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      place: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      placeVerification: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (cb: (tx: any) => Promise<any>) => cb(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaceContentService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<PlaceContentService>(PlaceContentService);
  });

  it('should be successfully initialized', () => {
    expect(service).toBeDefined();
  });

  describe('getPendingPlaces', () => {
    it('should query places with contentStatus PENDING_REVIEW', async () => {
      const mockPending = [
        { id: 'p-1', name: 'Tirathgarh Falls', contentStatus: 'PENDING_REVIEW' },
      ];
      prismaMock.place.findMany.mockResolvedValue(mockPending);

      const result = await service.getPendingPlaces();

      expect(result).toEqual(mockPending);
      expect(prismaMock.place.findMany).toHaveBeenCalledWith({
        where: { contentStatus: 'PENDING_REVIEW' },
        include: {
          category: true,
          media: true,
          contentOwner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('getPlaceForReview', () => {
    it('should return place review packet if place exists', async () => {
      const mockPlace = {
        id: 'p-1',
        name: 'Kanger Valley',
        verificationHistory: [],
      };
      prismaMock.place.findUnique.mockResolvedValue(mockPlace);

      const result = await service.getPlaceForReview('p-1');

      expect(result).toEqual(mockPlace);
      expect(prismaMock.place.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'p-1' } }),
      );
    });

    it('should throw NotFoundException if place does not exist', async () => {
      prismaMock.place.findUnique.mockResolvedValue(null);

      await expect(service.getPlaceForReview('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('verifyPlace', () => {
    it('should throw NotFoundException if place does not exist', async () => {
      prismaMock.place.findUnique.mockResolvedValue(null);

      await expect(
        service.verifyPlace('missing-id', 'reviewer-1', {
          decision: 'APPROVED',
          verificationLevel: 'OFFICIAL',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if place is archived', async () => {
      prismaMock.place.findUnique.mockResolvedValue({
        id: 'p-1',
        contentStatus: 'ARCHIVED',
        verificationLevel: 'UNVERIFIED',
      });

      await expect(
        service.verifyPlace('p-1', 'reviewer-1', {
          decision: 'APPROVED',
          verificationLevel: 'OFFICIAL',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should approve place and write verification audit log in transaction', async () => {
      const existingPlace = {
        id: 'p-1',
        name: 'Chitrakote',
        contentStatus: 'PENDING_REVIEW',
        verificationLevel: 'UNVERIFIED',
      };
      prismaMock.place.findUnique.mockResolvedValue(existingPlace);
      prismaMock.place.update.mockResolvedValue({
        ...existingPlace,
        verified: true,
        contentStatus: 'APPROVED',
        verificationLevel: 'COMMUNITY_VERIFIED',
      });

      const result = await service.verifyPlace('p-1', 'rev-user-id', {
        decision: 'APPROVED',
        verificationLevel: 'COMMUNITY_VERIFIED',
        notes: 'Verified GPS coordinates via drone reconnaissance',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('APPROVED');
      expect(result.verificationLevel).toBe('COMMUNITY_VERIFIED');
      expect(prismaMock.place.update).toHaveBeenCalledWith({
        where: { id: 'p-1' },
        data: expect.objectContaining({
          verified: true,
          contentStatus: 'APPROVED',
          verificationLevel: 'COMMUNITY_VERIFIED',
        }),
      });
      expect(prismaMock.placeVerification.create).toHaveBeenCalledWith({
        data: {
          placeId: 'p-1',
          reviewerId: 'rev-user-id',
          fromLevel: 'UNVERIFIED',
          toLevel: 'COMMUNITY_VERIFIED',
          decision: 'APPROVED',
          notes: 'Verified GPS coordinates via drone reconnaissance',
        },
      });
    });

    it('should reject place when decision is REJECTED', async () => {
      const existingPlace = {
        id: 'p-2',
        name: 'Spam Place',
        contentStatus: 'PENDING_REVIEW',
        verificationLevel: 'UNVERIFIED',
      };
      prismaMock.place.findUnique.mockResolvedValue(existingPlace);
      prismaMock.place.update.mockResolvedValue({
        ...existingPlace,
        verified: false,
        contentStatus: 'REJECTED',
        verificationLevel: 'UNVERIFIED',
      });

      const result = await service.verifyPlace('p-2', 'rev-user-id', {
        decision: 'REJECTED',
        notes: 'Inaccurate coordinates and insufficient description',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('REJECTED');
      expect(prismaMock.placeVerification.create).toHaveBeenCalledWith({
        data: {
          placeId: 'p-2',
          reviewerId: 'rev-user-id',
          fromLevel: 'UNVERIFIED',
          toLevel: 'UNVERIFIED',
          decision: 'REJECTED',
          notes: 'Inaccurate coordinates and insufficient description',
        },
      });
    });
  });

  describe('revokeVerification', () => {
    it('should reset place to unverified and log revocation', async () => {
      const existingPlace = {
        id: 'p-1',
        name: 'Chitrakote',
        contentStatus: 'APPROVED',
        verificationLevel: 'OFFICIAL',
      };
      prismaMock.place.findUnique.mockResolvedValue(existingPlace);
      prismaMock.place.update.mockResolvedValue({
        ...existingPlace,
        verified: false,
        contentStatus: 'PENDING_REVIEW',
        verificationLevel: 'UNVERIFIED',
      });

      const result = await service.revokeVerification('p-1', 'admin-id', 'Reported incorrect metadata');

      expect(result.success).toBe(true);
      expect(result.status).toBe('PENDING_REVIEW');
      expect(prismaMock.placeVerification.create).toHaveBeenCalledWith({
        data: {
          placeId: 'p-1',
          reviewerId: 'admin-id',
          fromLevel: 'OFFICIAL',
          toLevel: 'UNVERIFIED',
          decision: 'REVOKED',
          notes: 'Reported incorrect metadata',
        },
      });
    });
  });
});
