import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

const BOOKING_STATUS = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
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
        review: {
          select: {
            id: true,
            rating: true,
          },
        },
      },
      orderBy: {
        visitDate: 'asc',
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
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
          },
        },
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
      const result = await tx.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: BOOKING_STATUS.CANCELLED,
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
