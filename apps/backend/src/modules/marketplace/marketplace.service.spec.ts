import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryType, PartnerStatus } from '@prisma/client';
import { MarketplaceService } from './marketplace.service';
import { PrismaService } from '../../database/prisma.service';
import { availableCapacity, canPublishProduct, conversionRate } from './marketplace.types';

describe('Marketplace pure helpers', () => {
  it('canPublishProduct requires partnerVerified, active, price >= 0, and capacity > 0', () => {
    expect(
      canPublishProduct({ partnerVerified: true, active: true, price: 1500, capacity: 10 }),
    ).toBe(true);

    expect(
      canPublishProduct({ partnerVerified: false, active: true, price: 1500, capacity: 10 }),
    ).toBe(false);

    expect(
      canPublishProduct({ partnerVerified: true, active: false, price: 1500, capacity: 10 }),
    ).toBe(false);

    expect(
      canPublishProduct({ partnerVerified: true, active: true, price: -5, capacity: 10 }),
    ).toBe(false);

    expect(
      canPublishProduct({ partnerVerified: true, active: true, price: 100, capacity: 0 }),
    ).toBe(false);
  });

  it('availableCapacity clamps between 0 and capacity', () => {
    expect(availableCapacity(10, 3)).toBe(7);
    expect(availableCapacity(10, 10)).toBe(0);
    expect(availableCapacity(10, 15)).toBe(0);
    expect(availableCapacity(10, -2)).toBe(10);
  });

  it('conversionRate correctly calculates percentage or 0 when views <= 0', () => {
    expect(conversionRate(5, 100)).toBe(0.05);
    expect(conversionRate(1, 0)).toBe(0);
    expect(conversionRate(0, 50)).toBe(0);
  });
});

describe('MarketplaceService', () => {
  let service: MarketplaceService;
  let prisma: PrismaService;

  const mockPrisma = {
    partner: {
      findUnique: jest.fn(),
    },
    tourismProduct: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    productAvailability: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    commerceAuditLog: {
      create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<MarketplaceService>(MarketplaceService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('creates product with draft/inactive state and default policy', async () => {
      mockPrisma.partner.findUnique.mockResolvedValue({ id: 'partner-1' });
      mockPrisma.tourismProduct.findUnique.mockResolvedValue(null);
      mockPrisma.tourismProduct.create.mockResolvedValue({
        id: 'prod-1',
        name: 'Bastar Safari',
        slug: 'bastar-safari',
        active: false,
        partnerId: 'partner-1',
      });

      const res = await service.createProduct({
        partnerId: 'partner-1',
        name: 'Bastar Safari',
        description: 'Wildlife safari tour',
        type: InventoryType.EXPERIENCE,
        price: 1800,
        capacity: 8,
      });

      expect(res.id).toBe('prod-1');
      expect(mockPrisma.tourismProduct.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            active: false,
            slug: 'bastar-safari',
          }),
        }),
      );
    });

    it('rejects if partner does not exist', async () => {
      mockPrisma.partner.findUnique.mockResolvedValue(null);

      await expect(
        service.createProduct({
          partnerId: 'unknown',
          name: 'Camp',
          description: 'Camping',
          type: InventoryType.HOMESTAY,
          price: 900,
          capacity: 4,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('activateProduct', () => {
    it('activates product if partner is VERIFIED', async () => {
      mockPrisma.tourismProduct.findUnique.mockResolvedValue({
        id: 'prod-1',
        price: 1500,
        capacity: 6,
        active: false,
        partner: {
          id: 'partner-1',
          status: PartnerStatus.VERIFIED,
        },
      });
      mockPrisma.tourismProduct.update.mockResolvedValue({
        id: 'prod-1',
        active: true,
      });

      const res = await service.activateProduct('prod-1');
      expect(res.active).toBe(true);
      expect(mockPrisma.tourismProduct.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { active: true },
        include: { partner: true, policy: true },
      });
    });

    it('rejects activation if partner is not VERIFIED', async () => {
      mockPrisma.tourismProduct.findUnique.mockResolvedValue({
        id: 'prod-1',
        price: 1500,
        capacity: 6,
        active: false,
        partner: {
          id: 'partner-1',
          status: PartnerStatus.PENDING,
        },
      });

      await expect(service.activateProduct('prod-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('addAvailability', () => {
    it('creates availability slot if start < end and in future', async () => {
      mockPrisma.tourismProduct.findUnique.mockResolvedValue({ id: 'prod-1' });
      mockPrisma.productAvailability.create.mockResolvedValue({
        id: 'avail-1',
        capacity: 10,
        reserved: 0,
      });

      const futureStart = new Date(Date.now() + 86400000).toISOString();
      const futureEnd = new Date(Date.now() + 90000000).toISOString();

      const res = await service.addAvailability('prod-1', {
        startAt: futureStart,
        endAt: futureEnd,
        capacity: 10,
      });

      expect(res.id).toBe('avail-1');
    });

    it('rejects if startAt is after endAt', async () => {
      mockPrisma.tourismProduct.findUnique.mockResolvedValue({ id: 'prod-1' });

      const futureStart = new Date(Date.now() + 90000000).toISOString();
      const futureEnd = new Date(Date.now() + 86400000).toISOString();

      await expect(
        service.addAvailability('prod-1', {
          startAt: futureStart,
          endAt: futureEnd,
          capacity: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
