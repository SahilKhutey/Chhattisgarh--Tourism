import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PartnerStatus } from '@prisma/client';
import { PartnersService } from './partners.service';
import { PrismaService } from '../../database/prisma.service';

describe('PartnersService', () => {
  let service: PartnersService;
  let prisma: PrismaService;

  const mockPrisma = {
    partner: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    commerceAuditLog: {
      create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PartnersService>(PartnersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a pending partner if slug is unique', async () => {
      mockPrisma.partner.findUnique.mockResolvedValue(null);
      mockPrisma.partner.create.mockResolvedValue({
        id: 'partner-1',
        name: 'Bastar Eco Camp',
        slug: 'bastar-eco-camp',
        status: PartnerStatus.PENDING,
      });

      const result = await service.create({
        name: 'Bastar Eco Camp',
        email: 'sunil@bastarcamp.com',
        phone: '9876543210',
        districtId: 'bastar',
      });

      expect(result.id).toBe('partner-1');
      expect(mockPrisma.partner.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PartnerStatus.PENDING,
            slug: 'bastar-eco-camp',
          }),
        }),
      );
      expect(mockPrisma.commerceAuditLog.create).toHaveBeenCalled();
    });

    it('throws ConflictException if partner slug already exists', async () => {
      mockPrisma.partner.findUnique.mockResolvedValue({ id: 'existing-p' });

      await expect(
        service.create({
          name: 'Existing Partner',
          slug: 'existing-partner',
          email: 'test@partner.com',
          phone: '9876543210',
          districtId: 'raipur',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('verify', () => {
    it('updates partner status to VERIFIED', async () => {
      mockPrisma.partner.findUnique.mockResolvedValue({
        id: 'p-1',
        status: PartnerStatus.PENDING,
      });
      mockPrisma.partner.update.mockResolvedValue({
        id: 'p-1',
        status: PartnerStatus.VERIFIED,
      });

      const res = await service.verify('p-1', {
        status: PartnerStatus.VERIFIED,
        reason: 'KYC verified successfully',
      });

      expect(res.status).toBe(PartnerStatus.VERIFIED);
      expect(mockPrisma.partner.update).toHaveBeenCalledWith({
        where: { id: 'p-1' },
        data: expect.objectContaining({
          status: PartnerStatus.VERIFIED,
        }),
      });
    });

    it('throws NotFoundException if partner not found', async () => {
      mockPrisma.partner.findUnique.mockResolvedValue(null);

      await expect(
        service.verify('p-none', { status: PartnerStatus.VERIFIED }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('suspend', () => {
    it('suspends partner and logs audit', async () => {
      mockPrisma.partner.findUnique.mockResolvedValue({ id: 'p-1', status: PartnerStatus.VERIFIED });
      mockPrisma.partner.update.mockResolvedValue({
        id: 'p-1',
        status: PartnerStatus.SUSPENDED,
      });

      const res = await service.suspend('p-1', { reason: 'Terms violation' });
      expect(res.status).toBe(PartnerStatus.SUSPENDED);
      expect(mockPrisma.commerceAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'PARTNER_SUSPENDED',
            entityId: 'p-1',
          }),
        }),
      );
    });
  });

  describe('getStats', () => {
    it('computes partner active products and completed booking GMV', async () => {
      mockPrisma.partner.findUnique.mockResolvedValue({
        id: 'p-1',
        name: 'Eco Stay',
        status: PartnerStatus.VERIFIED,
        products: [
          { id: 'prod-1', active: true },
          { id: 'prod-2', active: false },
        ],
        bookings: [
          { id: 'b-1', status: 'COMPLETED', totalAmount: '2500', totalPricePaise: null },
          { id: 'b-2', status: 'CANCELLED', totalAmount: '1200', totalPricePaise: null },
          { id: 'b-3', status: 'COMPLETED', totalAmount: '3500', totalPricePaise: null },
        ],
      });

      const stats = await service.getStats('p-1');
      expect(stats.totalProducts).toBe(2);
      expect(stats.activeProducts).toBe(1);
      expect(stats.totalBookings).toBe(3);
      expect(stats.completedBookings).toBe(2);
      expect(stats.totalGmv).toBe(6000);
    });
  });
});
