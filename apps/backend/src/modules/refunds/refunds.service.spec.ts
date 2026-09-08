import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentStatus } from '@prisma/client';
import { RefundsService } from './refunds.service';
import { calculateRefund } from './refunds.types';
import { PrismaService } from '../../database/prisma.service';

describe('Refunds pure helpers: calculateRefund', () => {
  const policy = {
    fullRefundHours: 48,
    partialRefundHours: 24,
    partialRefundPercent: 50,
  };

  it('awards 100% refund when cancelled >= 48 hours before start', () => {
    const quote = calculateRefund(2000, 50, policy);
    expect(quote.refundType).toBe('FULL');
    expect(quote.refundPercent).toBe(100);
    expect(quote.refundAmount).toBe(2000);
  });

  it('awards 50% refund when cancelled between 24 and 48 hours before start', () => {
    const quote = calculateRefund(2000, 30, policy);
    expect(quote.refundType).toBe('PARTIAL');
    expect(quote.refundPercent).toBe(50);
    expect(quote.refundAmount).toBe(1000);
  });

  it('awards 0% refund when cancelled < 24 hours before start', () => {
    const quote = calculateRefund(2000, 10, policy);
    expect(quote.refundType).toBe('NONE');
    expect(quote.refundPercent).toBe(0);
    expect(quote.refundAmount).toBe(0);
  });

  it('handles custom partial refund percentages accurately', () => {
    const customPolicy = {
      fullRefundHours: 72,
      partialRefundHours: 36,
      partialRefundPercent: 70,
    };
    const quote = calculateRefund(1500, 40, customPolicy);
    expect(quote.refundType).toBe('PARTIAL');
    expect(quote.refundAmount).toBe(1050);
  });
});

describe('RefundsService', () => {
  let service: RefundsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      booking: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      productAvailability: {
        update: jest.fn(),
      },
      commerceAuditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefundsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<RefundsService>(RefundsService);
  });

  describe('processRefund', () => {
    it('cancels booking, releases capacity, and processes full refund for distant future booking', async () => {
      const futureDate = new Date(Date.now() + 72 * 3600 * 1000); // 72 hours out
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-1',
        userId: 'user-1',
        visitDate: futureDate,
        totalAmount: '2500.00',
        status: 'CONFIRMED',
        paymentStatus: PaymentStatus.PAID,
        availabilityId: 'avail-1',
        quantity: 2,
        product: {
          policy: {
            fullRefundHours: 48,
            partialRefundHours: 24,
            partialRefundPercent: '50.00',
          },
        },
      });

      prisma.booking.update.mockResolvedValue({
        id: 'b-1',
        status: 'CANCELLED',
        paymentStatus: PaymentStatus.REFUNDED,
      });

      const res = await service.processRefund('user-1', {
        bookingId: 'b-1',
        reason: 'Change of plans',
      });

      expect(res.success).toBe(true);
      expect(res.quote.refundType).toBe('FULL');
      expect(res.quote.refundAmount).toBe(2500);
      expect(prisma.productAvailability.update).toHaveBeenCalledWith({
        where: { id: 'avail-1' },
        data: { reserved: { decrement: 2 } },
      });
      expect(prisma.booking.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'b-1' },
          data: expect.objectContaining({
            status: 'CANCELLED',
            paymentStatus: PaymentStatus.REFUNDED,
          }),
        }),
      );
    });

    it('rejects if booking does not belong to user', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-1',
        userId: 'other-user',
      });

      await expect(
        service.processRefund('user-1', { bookingId: 'b-1' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
