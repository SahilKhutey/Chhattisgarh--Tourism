import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentStatus } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { MockPaymentProvider } from './mock-payment.provider';
import { PrismaService } from '../../database/prisma.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: any;
  let provider: MockPaymentProvider;

  beforeEach(async () => {
    prisma = {
      idempotencyKey: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      booking: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      commerceAuditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        MockPaymentProvider,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    provider = module.get<MockPaymentProvider>(MockPaymentProvider);
  });

  describe('createPaymentIntent', () => {
    it('creates a new payment intent and records idempotency key', async () => {
      prisma.idempotencyKey.findUnique.mockResolvedValue(null);
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-1',
        userId: 'user-1',
        totalAmount: '2400.00',
        currency: 'INR',
        paymentStatus: PaymentStatus.UNPAID,
      });

      const res = await service.createPaymentIntent('user-1', {
        bookingId: 'b-1',
        idempotencyKey: 'idem-key-1',
      });

      expect(res.success).toBe(true);
      expect(res.amount).toBe(2400);
      expect(prisma.idempotencyKey.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            key: 'idem-key-1',
          }),
        }),
      );
    });

    it('returns cached response when idempotency key already exists', async () => {
      prisma.idempotencyKey.findUnique.mockResolvedValue({
        key: 'idem-existing',
        response: { success: true, paymentIntentId: 'pi_cached' },
      });

      const res = await service.createPaymentIntent('user-1', {
        bookingId: 'b-1',
        idempotencyKey: 'idem-existing',
      });

      expect(res.paymentIntentId).toBe('pi_cached');
      expect(prisma.booking.findUnique).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException if paying for another user booking', async () => {
      prisma.idempotencyKey.findUnique.mockResolvedValue(null);
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-1',
        userId: 'other-user',
        paymentStatus: PaymentStatus.UNPAID,
      });

      await expect(
        service.createPaymentIntent('user-1', { bookingId: 'b-1' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('handleWebhook', () => {
    it('processes payment.succeeded and updates booking status', async () => {
      prisma.booking.findUnique.mockResolvedValue({ id: 'b-1', status: 'CONFIRMED' });

      const res = await service.handleWebhook(
        {
          event: 'payment.succeeded',
          paymentIntentId: 'pi_123',
          bookingId: 'b-1',
          amount: 1500,
          status: 'paid',
        },
        'sig_valid_test',
      );

      expect(res.received).toBe(true);
      expect(prisma.booking.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'b-1' },
          data: expect.objectContaining({ paymentStatus: PaymentStatus.PAID }),
        }),
      );
    });

    it('rejects invalid webhook signatures', async () => {
      await expect(
        service.handleWebhook(
          {
            event: 'payment.succeeded',
            paymentIntentId: 'pi_123',
            bookingId: 'b-1',
            amount: 1500,
            status: 'paid',
          },
          'invalid_sig',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
