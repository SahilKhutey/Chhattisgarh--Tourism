import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      where: {
        id: dto.bookingId,
      },
      include: {
        place: {
          select: {
            id: true,
          },
        },
        review: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only review your own booking');
    }

    if (booking.placeId !== dto.placeId) {
      throw new BadRequestException('Review place does not match booking place');
    }

    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed visits can be reviewed');
    }

    if (booking.review) {
      throw new ConflictException('This booking has already been reviewed');
    }

    const existing = await this.prisma.review.findFirst({
      where: {
        bookingId: dto.bookingId,
      },
    });

    if (existing) {
      throw new ConflictException('Review already exists for this booking');
    }

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId,
          placeId: dto.placeId,
          bookingId: dto.bookingId,
          rating: dto.rating,
          comment: dto.comment.trim(),
          lang: dto.lang ?? 'en',
        },
        include: {
          user: {
            select: {
              fullName: true,
              avatar: true,
            },
          },
        },
      });

      await tx.analyticsEvent.create({
        data: {
          name: 'review_submitted',
          userId,
          placeId: dto.placeId,
          bookingId: dto.bookingId,
          metadata: JSON.stringify({
            rating: dto.rating,
            language: dto.lang ?? 'en',
          }),
        },
      });

      return {
        success: true,
        review: {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          lang: review.lang,
          createdAt: review.createdAt,
          reviewer: review.user,
        },
      };
    });
  }

  async getPlaceReviews(placeId: string) {
    const place = await this.prisma.place.findUnique({
      where: {
        id: placeId,
      },
      select: {
        id: true,
      },
    });

    if (!place) {
      throw new NotFoundException('Destination does not exist');
    }

    const reviews = await this.prisma.review.findMany({
      where: {
        placeId,
      },
      include: {
        user: {
          select: {
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = reviews.length;
    const ratingTotal = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating =
      total === 0 ? 0 : Number((ratingTotal / total).toFixed(2));

    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const review of reviews) {
      if (distribution[review.rating] !== undefined) {
        distribution[review.rating]++;
      }
    }

    return {
      summary: {
        totalReviews: total,
        averageRating,
        distribution,
      },
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        lang: review.lang,
        helpful: review.helpful,
        createdAt: review.createdAt,
        reviewer: {
          fullName: review.user.fullName,
          avatar: review.user.avatar,
        },
      })),
    };
  }
}
