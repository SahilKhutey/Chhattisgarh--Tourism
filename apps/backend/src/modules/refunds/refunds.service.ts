import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { calculateRefund, RefundQuote } from './refunds.types';
import { RequestRefundDto } from './dto/request-refund.dto';

@Injectable()
export class RefundsService {
  constructor(private readonly prisma: PrismaService) {}

  calculateRefund(amount: number, hoursBeforeStart: number, policy?: any): RefundQuote {
    return calculateRefund(amount, hoursBeforeStart, policy);
  }

  async getRefundQuote(userId: string, bookingId: string): Promise<RefundQuote> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        product: {
          include: { policy: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Cannot quote refund for another user booking');
    }

    const visitTime = booking.visitDate ? booking.visitDate.getTime() : Date.now();
    const hoursBeforeStart = (visitTime - Date.now()) / (1000 * 60 * 60);

    const amount = booking.totalAmount
      ? Number(booking.totalAmount)
      : booking.totalPricePaise
        ? booking.totalPricePaise / 100
        : booking.totalPrice;

    const policy = booking.product?.policy
      ? {
          fullRefundHours: booking.product.policy.fullRefundHours,
          partialRefundHours: booking.product.policy.partialRefundHours,
          partialRefundPercent: Number(booking.product.policy.partialRefundPercent),
        }
      : undefined;

    return calculateRefund(amount, hoursBeforeStart, policy);
  }

  async processRefund(userId: string, dto: RequestRefundDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        product: {
          include: { policy: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Cannot refund another user booking');
    }

    if (booking.status === 'CANCELLED' && booking.paymentStatus === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Booking has already been cancelled and refunded');
    }

    const visitTime = booking.visitDate ? booking.visitDate.getTime() : Date.now();
    const hoursBeforeStart = (visitTime - Date.now()) / (1000 * 60 * 60);

    const amount = booking.totalAmount
      ? Number(booking.totalAmount)
      : booking.totalPricePaise
        ? booking.totalPricePaise / 100
        : booking.totalPrice;

    const policy = booking.product?.policy
      ? {
          fullRefundHours: booking.product.policy.fullRefundHours,
          partialRefundHours: booking.product.policy.partialRefundHours,
          partialRefundPercent: Number(booking.product.policy.partialRefundPercent),
        }
      : undefined;

    const quote = calculateRefund(amount, hoursBeforeStart, policy);

    return this.prisma.$transaction(async (tx) => {
      // Release inventory slot capacity
      if (booking.availabilityId) {
        await tx.productAvailability.update({
          where: { id: booking.availabilityId },
          data: {
            reserved: { decrement: booking.quantity || booking.guests || 1 },
          },
        });
      }

      const updated = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: quote.refundAmount > 0 ? PaymentStatus.REFUNDED : PaymentStatus.PAID,
        },
      });

      await tx.commerceAuditLog.create({
        data: {
          actorId: userId,
          action: 'BOOKING_REFUND_PROCESSED',
          entityType: 'Booking',
          entityId: booking.id,
          newState: {
            reason: dto.reason,
            refundQuote: quote as any,
            refundStatus: updated.paymentStatus,
          },
        },
      });

      return {
        success: true,
        booking: updated,
        quote,
      };
    });
  }
}
