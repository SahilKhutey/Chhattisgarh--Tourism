import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';

describe('BookingsService Unit Tests', () => {
  let service: BookingsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      place: {
        findUnique: jest.fn(),
      },
      booking: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      analyticsEvent: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (callback: (tx: any) => Promise<any>) =>
        callback(prisma),
      ),
    };

    service = new BookingsService(prisma);
    process.env.BOOKING_PLATFORM_FEE_BPS = '500';
    process.env.BOOKING_CURRENCY = 'INR';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('creates a booking using database pricing and emits analytics event', async () => {
      prisma.place.findUnique.mockResolvedValue({
        id: 'place-id',
        name: 'Chitrakote Falls',
        heroImage: 'image.jpg',
        district: 'Bastar',
        bookingEnabled: true,
        bookingPricePaise: 50000,
        bookingMaxGuests: 10,
      });

      prisma.booking.create.mockResolvedValue({
        id: 'booking-id',
        totalPricePaise: 210000,
      });

      const result = await service.createBooking('user-id', {
        placeId: 'place-id',
        visitDate: '2099-12-25T10:00:00.000Z',
        guests: 4,
        contactPhone: '+919876543210',
        notes: 'Photography tour',
      });

      expect(prisma.booking.create).toHaveBeenCalled();
      const data = prisma.booking.create.mock.calls[0][0].data;
      expect(data.unitPricePaise).toBe(50000);
      expect(data.subtotalPaise).toBe(200000);
      expect(data.platformFeePaise).toBe(10000);
      expect(data.totalPricePaise).toBe(210000);
      expect(data.status).toBe('CONFIRMED');

      expect(prisma.analyticsEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'booking_created',
            userId: 'user-id',
            placeId: 'place-id',
            bookingId: 'booking-id',
          }),
        }),
      );

      expect(result.success).toBe(true);
      expect(result.pricing).toEqual({
        currency: 'INR',
        unitPricePaise: 50000,
        subtotalPaise: 200000,
        platformFeePaise: 10000,
        totalPricePaise: 210000,
      });
    });

    it('rejects unknown places with NotFoundException', async () => {
      prisma.place.findUnique.mockResolvedValue(null);

      await expect(
        service.createBooking('user-id', {
          placeId: 'missing-place',
          visitDate: '2099-12-25T10:00:00.000Z',
          guests: 2,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects disabled booking with BadRequestException', async () => {
      prisma.place.findUnique.mockResolvedValue({
        id: 'place-id',
        bookingEnabled: false,
        bookingPricePaise: 50000,
        bookingMaxGuests: 10,
      });

      await expect(
        service.createBooking('user-id', {
          placeId: 'place-id',
          visitDate: '2099-12-25T10:00:00.000Z',
          guests: 2,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects guest count above destination limit', async () => {
      prisma.place.findUnique.mockResolvedValue({
        id: 'place-id',
        bookingEnabled: true,
        bookingPricePaise: 50000,
        bookingMaxGuests: 2,
      });

      await expect(
        service.createBooking('user-id', {
          placeId: 'place-id',
          visitDate: '2099-12-25T10:00:00.000Z',
          guests: 3,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects invalid date format', async () => {
      await expect(
        service.createBooking('user-id', {
          placeId: 'place-id',
          visitDate: 'not-a-valid-date',
          guests: 1,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects past dates', async () => {
      await expect(
        service.createBooking('user-id', {
          placeId: 'place-id',
          visitDate: '2000-01-01T10:00:00.000Z',
          guests: 1,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects negative booking price configuration', async () => {
      prisma.place.findUnique.mockResolvedValue({
        id: 'place-id',
        bookingEnabled: true,
        bookingPricePaise: -100,
        bookingMaxGuests: 10,
      });

      await expect(
        service.createBooking('user-id', {
          placeId: 'place-id',
          visitDate: '2099-12-25T10:00:00.000Z',
          guests: 2,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('cancelBooking', () => {
    it('cancels confirmed booking and emits analytics event', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'booking-id',
        userId: 'user-id',
        placeId: 'place-id',
        totalPricePaise: 210000,
        status: 'CONFIRMED',
      });
      prisma.booking.update.mockResolvedValue({
        id: 'booking-id',
        status: 'CANCELLED',
      });

      const res = await service.cancelBooking('user-id', 'booking-id');
      expect(res.success).toBe(true);
      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-id' },
        data: { status: 'CANCELLED' },
      });
      expect(prisma.analyticsEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'booking_cancelled',
            userId: 'user-id',
            bookingId: 'booking-id',
          }),
        }),
      );
    });

    it('prevents cancelling another user booking with ForbiddenException', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'booking-id',
        userId: 'other-user',
        status: 'CONFIRMED',
      });

      await expect(
        service.cancelBooking('user-id', 'booking-id'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('prevents cancelling an already cancelled booking with BadRequestException', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'booking-id',
        userId: 'user-id',
        status: 'CANCELLED',
      });

      await expect(
        service.cancelBooking('user-id', 'booking-id'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws NotFoundException if booking does not exist', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelBooking('user-id', 'nonexistent-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('completeBooking', () => {
    it('completes confirmed booking and emits analytics event', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'booking-id',
        userId: 'user-id',
        placeId: 'place-id',
        status: 'CONFIRMED',
      });
      prisma.booking.update.mockResolvedValue({
        id: 'booking-id',
        status: 'COMPLETED',
      });

      const res = await service.completeBooking('booking-id');
      expect(res.status).toBe('COMPLETED');
      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-id' },
        data: { status: 'COMPLETED' },
      });
      expect(prisma.analyticsEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'booking_completed',
            bookingId: 'booking-id',
          }),
        }),
      );
    });

    it('rejects completing a non-confirmed booking', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'booking-id',
        status: 'CANCELLED',
      });

      await expect(
        service.completeBooking('booking-id'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws NotFoundException if booking does not exist', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(
        service.completeBooking('missing-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getMyBookings & getBooking', () => {
    it('getMyBookings returns list of user bookings', async () => {
      const mockList = [{ id: 'b-1', userId: 'user-id' }];
      prisma.booking.findMany.mockResolvedValue(mockList);

      const result = await service.getMyBookings('user-id');
      expect(result).toEqual(mockList);
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        include: expect.any(Object),
        orderBy: { visitDate: 'asc' },
      });
    });

    it('getBooking returns single booking for owner', async () => {
      const mockBooking = { id: 'b-1', userId: 'user-id', status: 'CONFIRMED' };
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await service.getBooking('user-id', 'b-1');
      expect(result).toEqual(mockBooking);
    });

    it('getBooking throws ForbiddenException if requested by another user', async () => {
      prisma.booking.findUnique.mockResolvedValue({ id: 'b-1', userId: 'other-user' });

      await expect(
        service.getBooking('user-id', 'b-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('getBooking throws NotFoundException if booking not found', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(
        service.getBooking('user-id', 'missing-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
