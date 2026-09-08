import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { MockPaymentProvider } from './mock-payment.provider';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { WebhookEventPayload } from './payment-provider.interface';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentProvider: MockPaymentProvider,
  ) {}

  async createPaymentIntent(userId: string, dto: CreatePaymentIntentDto) {
    if (dto.idempotencyKey) {
      const existing = await this.prisma.idempotencyKey.findUnique({
        where: { key: dto.idempotencyKey },
      });
      if (existing && existing.response) {
        return existing.response as any;
      }
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { user: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Cannot pay for another user booking');
    }

    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Booking has already been paid');
    }

    const amount = booking.totalAmount
      ? Number(booking.totalAmount)
      : booking.totalPricePaise
        ? booking.totalPricePaise / 100
        : booking.totalPrice;

    const intent = await this.paymentProvider.createPaymentIntent({
      bookingId: booking.id,
      amount,
      currency: booking.currency || 'INR',
      customerEmail: booking.user?.email,
      customerPhone: booking.contactPhone ?? undefined,
    });

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: PaymentStatus.AUTHORIZED,
      },
    });

    const response = {
      success: true,
      bookingId: booking.id,
      paymentIntentId: intent.paymentIntentId,
      clientSecret: intent.clientSecret,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
    };

    if (dto.idempotencyKey) {
      await this.prisma.idempotencyKey.create({
        data: {
          key: dto.idempotencyKey,
          operation: 'PAYMENT_INTENT_CREATE',
          userId,
          response,
        },
      });
    }

    return response;
  }

  async handleWebhook(payload: WebhookEventPayload, signature?: string) {
    const isValid = this.paymentProvider.verifyWebhookSignature(payload, signature || '');
    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: payload.bookingId },
    });

    if (!booking) {
      throw new NotFoundException(`Booking '${payload.bookingId}' not found`);
    }

    if (payload.event === 'payment.succeeded') {
      await this.prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            status: 'CONFIRMED',
          },
        });

        await tx.commerceAuditLog.create({
          data: {
            action: 'PAYMENT_SUCCEEDED',
            entityType: 'Booking',
            entityId: booking.id,
            newState: {
              paymentIntentId: payload.paymentIntentId,
              amount: payload.amount,
              paymentStatus: PaymentStatus.PAID,
            },
          },
        });
      });
    } else if (payload.event === 'payment.failed') {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: PaymentStatus.FAILED,
        },
      });
    }

    return { received: true };
  }
}
