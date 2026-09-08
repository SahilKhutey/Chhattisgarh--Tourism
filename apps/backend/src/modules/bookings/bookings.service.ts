import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PartnerStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateMarketplaceBookingDto } from './dto/create-marketplace-booking.dto';

const BOOKING_STATUS = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
} as const;

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private getPlatformFeeBps(): number {
    const value = Number(process.env.BOOKING_PLATFORM_FEE_BPS ?? 500);

    if (!Number.isInteger(value) || value < 0 || value > 10_000) {
      throw new Error(
        'BOOKING_PLATFORM_FEE_BPS must be an integer between 0 and 10000',
      );
    }

    return value;
  }

  private calculatePricing(unitPricePaise: number, guests: number) {
    const subtotalPaise = unitPricePaise * guests;
    const platformFeePaise = Math.floor(
      (subtotalPaise * this.getPlatformFeeBps()) / 10_000,
    );
    const totalPricePaise = subtotalPaise + platformFeePaise;

    return {
      unitPricePaise,
      subtotalPaise,
      platformFeePaise,
      totalPricePaise,
    };
  }

  async createBooking(userId: string, dto: CreateBookingDto) {
    const visitDate = new Date(dto.visitDate);

    if (Number.isNaN(visitDate.getTime())) {
      throw new BadRequestException('Invalid visit date');
    }

    if (visitDate.getTime() < Date.now()) {
      throw new BadRequestException('Visit date must be in the future');
    }

    const place = await this.prisma.place.findUnique({
      where: {
        id: dto.placeId,
      },
      select: {
        id: true,
        name: true,
        heroImage: true,
        district: true,
        bookingEnabled: true,
        bookingPricePaise: true,
        bookingMaxGuests: true,
      },
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    if (!place.bookingEnabled) {
      throw new BadRequestException(
        'Booking is currently unavailable for this destination',
      );
    }

    if (dto.guests > place.bookingMaxGuests) {
      throw new BadRequestException(
        `Maximum allowed guests is ${place.bookingMaxGuests}`,
      );
    }

    if (place.bookingPricePaise < 0) {
      throw new BadRequestException('Invalid booking price configuration');
    }

    const pricing = this.calculatePricing(place.bookingPricePaise, dto.guests);

    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId,
          placeId: place.id,
          visitDate,
          guests: dto.guests,
          unitPricePaise: pricing.unitPricePaise,
          subtotalPaise: pricing.subtotalPaise,
          platformFeePaise: pricing.platformFeePaise,
          totalPricePaise: pricing.totalPricePaise,
          currency: process.env.BOOKING_CURRENCY ?? 'INR',
          totalPrice: pricing.totalPricePaise / 100,
          status: BOOKING_STATUS.CONFIRMED,
          contactPhone: dto.contactPhone,
          notes: dto.notes,
        },
        include: {
          place: {
            select: {
              name: true,
              heroImage: true,
              district: true,
            },
          },
        },
      });

      await tx.analyticsEvent.create({
        data: {
          name: 'booking_created',
          userId,
          placeId: place.id,
          bookingId: booking.id,
          metadata: JSON.stringify({
            guests: dto.guests,
            subtotalPaise: pricing.subtotalPaise,
            platformFeePaise: pricing.platformFeePaise,
            totalPricePaise: pricing.totalPricePaise,
            currency: process.env.BOOKING_CURRENCY ?? 'INR',
          }),
        },
      });

      return {
        success: true,
        booking,
        pricing: {
          currency: process.env.BOOKING_CURRENCY ?? 'INR',
          unitPricePaise: pricing.unitPricePaise,
          subtotalPaise: pricing.subtotalPaise,
          platformFeePaise: pricing.platformFeePaise,
          totalPricePaise: pricing.totalPricePaise,
        },
      };
    });
  }

  async createMarketplaceBooking(
    userId: string,
    dto: CreateMarketplaceBookingDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.tourismProduct.findUnique({
        where: { id: dto.productId },
        include: {
          partner: true,
          policy: true,
        },
      });

      if (!product) {
        throw new NotFoundException('Marketplace product not found');
      }

      if (!product.active) {
        throw new BadRequestException('Product is currently inactive');
      }

      if (product.partner.status !== PartnerStatus.VERIFIED) {
        throw new BadRequestException('Partner is not verified');
      }

      const availability = await tx.productAvailability.findUnique({
        where: { id: dto.availabilityId },
      });

      if (!availability || availability.productId !== product.id) {
        throw new NotFoundException('Selected availability slot not found for this product');
      }

      if (availability.startAt.getTime() < Date.now()) {
        throw new BadRequestException('Selected slot date is in the past');
      }

      const remainingCapacity = availability.capacity - availability.reserved;
      if (remainingCapacity < dto.quantity) {
        throw new BadRequestException(
          `Insufficient capacity. Requested: ${dto.quantity}, Available: ${remainingCapacity}`,
        );
      }

      // Decrement capacity atomically inside tx
      await tx.productAvailability.update({
        where: { id: dto.availabilityId },
        data: {
          reserved: { increment: dto.quantity },
        },
      });

      const unitPrice = Number(product.price);
      const totalAmount = unitPrice * dto.quantity;
      const refSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const bookingReference = `CGT-${Date.now()}-${refSuffix}`;

      const booking = await tx.booking.create({
        data: {
          userId,
          productId: product.id,
          partnerId: product.partnerId,
          availabilityId: dto.availabilityId,
          visitDate: availability.startAt,
          guests: dto.quantity,
          quantity: dto.quantity,
          unitPrice: product.price,
          totalAmount,
          totalPrice: totalAmount,
          currency: product.currency || 'INR',
          status: BOOKING_STATUS.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
          bookingReference,
          contactPhone: dto.contactPhone,
          notes: dto.notes,
        },
        include: {
          product: {
            include: {
              partner: true,
              policy: true,
            },
          },
        },
      });

      // Calculate and store partner commission
      const commissionRate = 10.0; // 10% platform fee
      const commissionAmount = Number((totalAmount * (commissionRate / 100)).toFixed(2));
      const partnerAmount = Number((totalAmount - commissionAmount).toFixed(2));

      await tx.partnerCommission.create({
        data: {
          bookingId: booking.id,
          partnerId: product.partnerId,
          grossAmount: totalAmount,
          commissionRate,
          commissionAmount,
          partnerAmount,
        },
      });

      await tx.commerceAuditLog.create({
        data: {
          actorId: userId,
          action: 'MARKETPLACE_BOOKING_CREATED',
          entityType: 'Booking',
          entityId: booking.id,
          newState: {
            bookingReference,
            totalAmount,
            quantity: dto.quantity,
            productId: product.id,
            partnerId: product.partnerId,
          },
        },
      });

      await tx.analyticsEvent.create({
        data: {
          name: 'marketplace_booking_created',
          userId,
          bookingId: booking.id,
          metadata: JSON.stringify({
            bookingReference,
            productId: product.id,
            partnerId: product.partnerId,
            quantity: dto.quantity,
            totalAmount,
          }),
        },
      });

      return {
        success: true,
        booking,
      };
    });
  }

  async getMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: {
        userId,
      },
      include: {
        place: {
          select: {
            name: true,
            heroImage: true,
            district: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        product: {
          include: {
            partner: {
              select: {
                id: true,
                name: true,
                slug: true,
                districtId: true,
              },
            },
            policy: true,
          },
        },
        review: {
          select: {
            id: true,
            rating: true,
          },
        },
        productReview: {
          select: {
            id: true,
            rating: true,
          },
        },
        commission: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getBooking(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        place: {
          select: {
            id: true,
            name: true,
            heroImage: true,
            district: true,
          },
        },
        product: {
          include: {
            partner: true,
            policy: true,
          },
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
          },
        },
        productReview: {
          select: {
            id: true,
            rating: true,
            title: true,
            body: true,
          },
        },
        commission: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only view your own bookings');
    }

    return booking;
  }

  async cancelBooking(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw new BadRequestException('Only confirmed bookings can be cancelled');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // If this booking holds availability capacity, release it!
      if (booking.availabilityId) {
        await tx.productAvailability.update({
          where: { id: booking.availabilityId },
          data: {
            reserved: { decrement: booking.quantity || booking.guests || 1 },
          },
        });
      }

      const result = await tx.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: BOOKING_STATUS.CANCELLED,
          paymentStatus: PaymentStatus.REFUND_PENDING,
        },
      });

      await tx.commerceAuditLog.create({
        data: {
          actorId: userId,
          action: 'BOOKING_CANCELLED',
          entityType: 'Booking',
          entityId: bookingId,
          previousState: { status: booking.status },
          newState: { status: BOOKING_STATUS.CANCELLED },
        },
      });

      await tx.analyticsEvent.create({
        data: {
          name: 'booking_cancelled',
          userId,
          placeId: booking.placeId,
          bookingId,
          metadata: JSON.stringify({
            totalPricePaise: booking.totalPricePaise,
            totalAmount: booking.totalAmount,
          }),
        },
      });

      return result;
    });

    return {
      success: true,
      booking: updated,
    };
  }

  async completeBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw new BadRequestException('Only confirmed bookings can be completed');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: BOOKING_STATUS.COMPLETED,
        },
      });

      await tx.commerceAuditLog.create({
        data: {
          action: 'BOOKING_COMPLETED',
          entityType: 'Booking',
          entityId: bookingId,
          previousState: { status: booking.status },
          newState: { status: BOOKING_STATUS.COMPLETED },
        },
      });

      await tx.analyticsEvent.create({
        data: {
          name: 'booking_completed',
          userId: booking.userId,
          placeId: booking.placeId,
          bookingId,
        },
      });

      return updated;
    });
  }
}
