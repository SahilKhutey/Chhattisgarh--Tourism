import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommerceService } from './commerce.service';
import { calculateCommission } from './commerce.types';
import { PrismaService } from '../../database/prisma.service';

describe('Commerce pure helpers: calculateCommission', () => {
  it('correctly calculates 10% commission on 1000', () => {
    const res = calculateCommission(1000, 10);
    expect(res.grossAmount).toBe(1000);
    expect(res.commissionRate).toBe(10);
    expect(res.commissionAmount).toBe(100);
    expect(res.partnerAmount).toBe(900);
  });

  it('correctly calculates fractional commission with two decimal rounding', () => {
    const res = calculateCommission(499.5, 7.5);
    expect(res.grossAmount).toBe(499.5);
    expect(res.commissionAmount).toBe(37.46);
    expect(res.partnerAmount).toBe(462.04);
  });

  it('handles 0% commission rate', () => {
    const res = calculateCommission(500, 0);
    expect(res.commissionAmount).toBe(0);
    expect(res.partnerAmount).toBe(500);
  });

  it('throws for negative commission rate or rate > 100', () => {
    expect(() => calculateCommission(500, -5)).toThrow();
    expect(() => calculateCommission(500, 105)).toThrow();
  });
});

describe('CommerceService', () => {
  let service: CommerceService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      partner: {
        findUnique: jest.fn(),
      },
      partnerCommission: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommerceService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CommerceService>(CommerceService);
  });

  describe('getPartnerSettlement', () => {
    it('aggregates total gross, commission, and payable', async () => {
      prisma.partner.findUnique.mockResolvedValue({
        id: 'p-1',
        name: 'Eco Bastar',
      });

      prisma.partnerCommission.findMany.mockResolvedValue([
        { grossAmount: '1000.00', commissionAmount: '100.00', partnerAmount: '900.00' },
        { grossAmount: '2000.00', commissionAmount: '200.00', partnerAmount: '1800.00' },
      ]);

      const res = await service.getPartnerSettlement('p-1');
      expect(res.totalRecords).toBe(2);
      expect(res.totalGross).toBe(3000);
      expect(res.totalCommission).toBe(300);
      expect(res.totalPayable).toBe(2700);
    });

    it('throws NotFoundException if partner not found', async () => {
      prisma.partner.findUnique.mockResolvedValue(null);

      await expect(service.getPartnerSettlement('p-none')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
