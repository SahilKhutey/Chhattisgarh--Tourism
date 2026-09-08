import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PartnerStatus } from '@prisma/client';
import { BookingsService } from './bookings.service';

describe('BookingsService Unit Tests', () => {
  let service: BookingsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      place: {
        findUnique: jest.fn(),
      },
      tourismProduct: {
        findUnique: jest.fn(),
      },
      productAvailability: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      partnerCommission: {
        create: jest.fn(),
      },
      commerceAuditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
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

  describe('createBooking (legacy place booking)', () => {
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
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects booking when bookingEnabled is false', async () => {
      prisma.place.findUnique.mockResolvedValue({
        id: 'place-id',
        bookingEnabled: false,
        bookingMaxGuests: 10,
        bookingPricePaise: 10000,
      });

      await expect(
        service.createBooking('user-id', {
          placeId: 'place-id',
          visitDate: '2099-12-25T10:00:00.000Z',
          guests: 2,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createMarketplaceBooking', () => {
    it('creates product booking, reserves capacity, and creates commission', async () => {
      prisma.tourismProduct.findUnique.mockResolvedValue({
        id: 'prod-1',
        partnerId: 'part-1',
        active: true,
        price: 1500,
        currency: 'INR',
        partner: {
          id: 'part-1',
          status: PartnerStatus.VERIFIED,
        },
      });

      prisma.productAvailability.findUnique.mockResolvedValue({
        id: 'avail-1',
        productId: 'prod-1',
        capacity: 10,
        reserved: 2,
        startAt: new Date(Date.now() + 86400000),
      });

      prisma.booking.create.mockResolvedValue({
        id: 'booking-m1',
        bookingReference: 'CGT-123456-ABCDEF',
        totalAmount: 3000,
      });

      const res = await service.createMarketplaceBooking('user-1', {
        productId: 'prod-1',
        availabilityId: 'avail-1',
        quantity: 2,
        contactPhone: '9876543210',
      });

      expect(res.success).toBe(true);
      expect(prisma.productAvailability.update).toHaveBeenCalledWith({
        where: { id: 'avail-1' },
        data: { reserved: { increment: 2 } },
      });
      expect(prisma.partnerCommission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            grossAmount: 3000,
            commissionRate: 10,
            commissionAmount: 300,
            partnerAmount: 2700,
          }),
        }),
      );
    });

    it('rejects if product is inactive', async () => {
      prisma.tourismProduct.findUnique.mockResolvedValue({
        id: 'prod-1',
        active: false,
        partner: { status: PartnerStatus.VERIFIED },
      });

      await expect(
        service.createMarketplaceBooking('user-1', {
          productId: 'prod-1',
          availabilityId: 'avail-1',
          quantity: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects if partner is unverified', async () => {
      prisma.tourismProduct.findUnique.mockResolvedValue({
        id: 'prod-1',
        active: true,
        partner: { status: PartnerStatus.PENDING },
      });

      await expect(
        service.createMarketplaceBooking('user-1', {
          productId: 'prod-1',
          availabilityId: 'avail-1',
          quantity: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects if requested quantity exceeds remaining capacity', async () => {
      prisma.tourismProduct.findUnique.mockResolvedValue({
        id: 'prod-1',
        active: true,
        partner: { status: PartnerStatus.VERIFIED },
      });

      prisma.productAvailability.findUnique.mockResolvedValue({
        id: 'avail-1',
        productId: 'prod-1',
        capacity: 5,
        reserved: 4, // only 1 left
        startAt: new Date(Date.now() + 86400000),
      });

      await expect(
        service.createMarketplaceBooking('user-1', {
          productId: 'prod-1',
          availabilityId: 'avail-1',
          quantity: 2,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelBooking', () => {
    it('cancels confirmed booking and decrements reserved capacity if availabilityId set', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-1',
        userId: 'user-1',
        status: 'CONFIRMED',
        availabilityId: 'avail-1',
        quantity: 2,
      });

      prisma.booking.update.mockResolvedValue({
        id: 'b-1',
        status: 'CANCELLED',
      });

      const res = await service.cancelBooking('user-1', 'b-1');
      expect(res.success).toBe(true);
      expect(prisma.productAvailability.update).toHaveBeenCalledWith({
        where: { id: 'avail-1' },
        data: { reserved: { decrement: 2 } },
      });
      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'b-1' },
        data: expect.objectContaining({ status: 'CANCELLED' }),
      });
    });

    it('throws ForbiddenException if cancelling another user booking', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-1',
        userId: 'other-user',
        status: 'CONFIRMED',
      });

      await expect(service.cancelBooking('user-1', 'b-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('completeBooking', () => {
    it('marks confirmed booking as COMPLETED', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-1',
        status: 'CONFIRMED',
        userId: 'user-1',
      });

      prisma.booking.update.mockResolvedValue({
        id: 'b-1',
        status: 'COMPLETED',
      });

      const res = await service.completeBooking('b-1');
      expect(res.status).toBe('COMPLETED');
    });
  });
});
