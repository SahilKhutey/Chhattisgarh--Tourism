import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ReviewsService Unit Tests', () => {
  let service: ReviewsService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      place: {
        findUnique: jest.fn(),
      },
      review: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be successfully initialized', () => {
    expect(service).toBeDefined();
  });

  describe('createReview operations tests', () => {
    it('should throw NotFoundException if targeted place ID is invalid or missing in PostgreSQL', async () => {
      const reviewDto = {
        placeId: 'invalid-place-uuid',
        rating: 5,
        comment: 'This is a beautiful regional path cascades.',
      };
      prismaMock.place.findUnique.mockResolvedValue(null);

      await expect(service.createReview('user-uuid-1', reviewDto)).rejects.toThrow(NotFoundException);
    });

    it('should persist new review node and return reviewer metadata successfully', async () => {
      const reviewDto = {
        placeId: 'valid-place-uuid',
        rating: 5,
        comment: 'Beautiful forest views at Chitrakote Falls!',
      };

      prismaMock.place.findUnique.mockResolvedValue({ id: 'valid-place-uuid', name: 'Chitrakote Falls' });
      prismaMock.review.create.mockResolvedValue({
        id: 'new-review-uuid',
        rating: 5,
        comment: 'Beautiful forest views at Chitrakote Falls!',
        createdAt: new Date(),
        user: { fullName: 'Aarav Mandavi' },
      });

      const result = await service.createReview('user-uuid-1', reviewDto);

      expect(result.success).toBe(true);
      expect(result.review.rating).toBe(5);
      expect(result.review.reviewer).toBe('Aarav Mandavi');
      expect(prismaMock.review.create).toHaveBeenCalled();
    });
  });

  describe('getPlaceReviews chronological feeds tests', () => {
    it('should throw NotFoundException if place ID does not exist in PostgreSQL', async () => {
      prismaMock.place.findUnique.mockResolvedValue(null);
      await expect(service.getPlaceReviews('invalid-place-uuid')).rejects.toThrow(NotFoundException);
    });

    it('should return reviews feed mapped with reviewer profile information', async () => {
      prismaMock.place.findUnique.mockResolvedValue({ id: 'valid-place-uuid' });

      const mockDbReviews = [
        {
          id: 'r-1',
          rating: 5,
          comment: 'Perfect local trails!',
          createdAt: new Date(),
          user: { fullName: 'Aarav Mandavi', avatar: 'avatar_url' },
        },
      ];
      prismaMock.review.findMany.mockResolvedValue(mockDbReviews);

      const result = await service.getPlaceReviews('valid-place-uuid');

      expect(result.length).toBe(1);
      expect(result[0].reviewer.fullName).toBe('Aarav Mandavi');
      expect(result[0].comment).toBe('Perfect local trails!');
      expect(prismaMock.review.findMany).toHaveBeenCalled();
    });
  });
});
