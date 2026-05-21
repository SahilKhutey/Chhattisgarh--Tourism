import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(userId: string, createBookingDto: CreateBookingDto) {
    // Optionally check if the place exists
    const place = await this.prisma.place.findUnique({
      where: { id: createBookingDto.placeId },
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    // Default mock price calculation
    const basePricePerPerson = 500;
    const totalPrice = createBookingDto.guests * basePricePerPerson;

    return this.prisma.booking.create({
      data: {
        userId,
        placeId: createBookingDto.placeId,
        visitDate: new Date(createBookingDto.visitDate),
        guests: createBookingDto.guests,
        contactPhone: createBookingDto.contactPhone,
        notes: createBookingDto.notes,
        totalPrice,
        status: 'CONFIRMED',
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
  }

  async getMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
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
      },
      orderBy: {
        visitDate: 'asc',
      },
    });
  }

  async cancelBooking(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });
  }
}
