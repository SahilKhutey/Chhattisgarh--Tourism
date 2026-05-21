import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    // 1. Verify that the destination place exists
    const place = await this.prisma.place.findUnique({
      where: { id: dto.placeId },
    });

    if (!place) {
      throw new NotFoundException(`Destination with ID ${dto.placeId} does not exist.`);
    }

    // 2. Persist the review node
    const review = await this.prisma.review.create({
      data: {
        userId,
        placeId: dto.placeId,
        rating: dto.rating,
        comment: dto.comment,
        lang: dto.lang || 'en',
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Review submitted successfully.',
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        lang: review.lang,
        createdAt: review.createdAt,
        reviewer: review.user.fullName,
      },
    };
  }

  async getPlaceReviews(placeId: string) {
    // Verify that the destination place exists
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException(`Destination with ID ${placeId} does not exist.`);
    }

    const reviews = await this.prisma.review.findMany({
      where: { placeId },
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

    return reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      lang: r.lang,
      createdAt: r.createdAt,
      reviewer: {
        fullName: r.user.fullName,
        avatar: r.user.avatar,
      },
    }));
  }
}
