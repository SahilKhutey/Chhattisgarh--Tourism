import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';

describe('ReviewsService Unit Tests', () => {
  let service: ReviewsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      booking: {
        findUnique: jest.fn(),
      },
      review: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
      place: {
        findUnique: jest.fn(),
      },
      analyticsEvent: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (callback: (tx: any) => Promise<any>) =>
        callback(prisma),
      ),
    };

    service = new ReviewsService(prisma);
  });

  describe('createReview', () => {
    it('creates a review for a completed booking and emits analytics event', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'booking-id',
        userId: 'user-id',
        placeId: 'place-id',
        status: 'COMPLETED',
        review: null,
        place: {
          id: 'place-id',
        },
      });

      prisma.review.findFirst.mockResolvedValue(null);

      prisma.review.create.mockResolvedValue({
        id: 'review-id',
        rating: 5,
        comment: 'Excellent experience visiting the falls',
        lang: 'en',
        createdAt: new Date(),
        user: {
          fullName: 'Test User',
          avatar: null,
        },
      });

      const result = await service.createReview('user-id', {
        placeId: 'place-id',
        bookingId: 'booking-id',
        rating: 5,
        comment: 'Excellent experience visiting the falls',
      });

      expect(result.success).toBe(true);
      expect(prisma.review.create).toHaveBeenCalled();
      expect(prisma.analyticsEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'review_submitted',
            userId: 'user-id',
            placeId: 'place-id',
            bookingId: 'booking-id',
          }),
        }),
      );
    });

    it('rejects unknown booking with NotFoundException', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(
        service.createReview('user-id', {
          placeId: 'place-id',
          bookingId: 'missing-booking',
          rating: 5,
          comment: 'Excellent experience',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects another user booking with ForbiddenException', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'booking-id',
        userId: 'other-user',
        placeId: 'place-id',
        status: 'COMPLETED',
        review: null,
      });

      await expect(
        service.createReview('user-id', {
          placeId: 'place-id',
          bookingId: 'booking-id',
          rating: 5,
          comment: 'Excellent experience',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects incomplete booking with BadRequestException', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'booking-id',
        userId: 'user-id',
        placeId: 'place-id',
        status: 'CONFIRMED',
        review: null,
      });

      await expect(
        service.createReview('user-id', {
          placeId: 'place-id',
          bookingId: 'booking-id',
          rating: 5,
          comment: 'Excellent experience',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects duplicate review via relation with ConflictException', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'booking-id',
        userId: 'user-id',
        placeId: 'place-id',
        status: 'COMPLETED',
        review: {
          id: 'existing-review',
        },
      });

      await expect(
        service.createReview('user-id', {
          placeId: 'place-id',
          bookingId: 'booking-id',
          rating: 5,
          comment: 'Excellent experience',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects duplicate review via existing record query with ConflictException', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'booking-id',
        userId: 'user-id',
        placeId: 'place-id',
        status: 'COMPLETED',
        review: null,
      });
      prisma.review.findFirst.mockResolvedValue({ id: 'existing-review' });

      await expect(
        service.createReview('user-id', {
          placeId: 'place-id',
          bookingId: 'booking-id',
          rating: 5,
          comment: 'Excellent experience',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects mismatched place and booking with BadRequestException', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'booking-id',
        userId: 'user-id',
        placeId: 'another-place',
        status: 'COMPLETED',
        review: null,
      });

      await expect(
        service.createReview('user-id', {
          placeId: 'place-id',
          bookingId: 'booking-id',
          rating: 5,
          comment: 'Excellent experience',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('getPlaceReviews & Rating Aggregation', () => {
    it('throws NotFoundException if destination does not exist', async () => {
      prisma.place.findUnique.mockResolvedValue(null);

      await expect(
        service.getPlaceReviews('missing-place'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('calculates rating distribution and average rating correctly', async () => {
      prisma.place.findUnique.mockResolvedValue({
        id: 'place-id',
      });

      prisma.review.findMany.mockResolvedValue([
        {
          id: '1',
          rating: 5,
          comment: 'Excellent destination',
          lang: 'en',
          helpful: 2,
          createdAt: new Date(),
          user: {
            fullName: 'A',
            avatar: null,
          },
        },
        {
          id: '2',
          rating: 4,
          comment: 'Very good destination',
          lang: 'en',
          helpful: 1,
          createdAt: new Date(),
          user: {
            fullName: 'B',
            avatar: null,
          },
        },
        {
          id: '3',
          rating: 5,
          comment: 'Wonderful experience',
          lang: 'en',
          helpful: 3,
          createdAt: new Date(),
          user: {
            fullName: 'C',
            avatar: null,
          },
        },
      ]);

      const result = await service.getPlaceReviews('place-id');

      expect(result.summary.totalReviews).toBe(3);
      expect(result.summary.averageRating).toBe(4.67);
      expect(result.summary.distribution[5]).toBe(2);
      expect(result.summary.distribution[4]).toBe(1);
      expect(result.summary.distribution[3]).toBe(0);
      expect(result.summary.distribution[2]).toBe(0);
      expect(result.summary.distribution[1]).toBe(0);
      expect(result.reviews.length).toBe(3);
    });

    it('handles destination with zero reviews gracefully', async () => {
      prisma.place.findUnique.mockResolvedValue({
        id: 'place-id',
      });
      prisma.review.findMany.mockResolvedValue([]);

      const result = await service.getPlaceReviews('place-id');

      expect(result.summary.totalReviews).toBe(0);
      expect(result.summary.averageRating).toBe(0);
      expect(result.summary.distribution).toEqual({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      });
      expect(result.reviews).toEqual([]);
    });
  });
});
