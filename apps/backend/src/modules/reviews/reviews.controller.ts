import { Controller, Post, Get, Body, Param, Headers, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiParam, ApiBody } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('Reviews & Feedback')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit traveler feedback review for destination' })
  @ApiHeader({ name: 'x-user-id', required: true, description: 'Simulated authorized User ID' })
  @ApiBody({ type: CreateReviewDto })
  async createReview(
    @Headers('x-user-id') userId: string,
    @Body(new ValidationPipe()) dto: CreateReviewDto,
  ) {
    if (!userId) {
      throw new UnauthorizedException('Authorization header x-user-id is required to submit reviews.');
    }
    return this.reviewsService.createReview(userId, dto);
  }

  @Get('place/:placeId')
  @ApiOperation({ summary: 'Retrieve reviews feed for targeted destination' })
  @ApiParam({ name: 'placeId', type: String, description: 'Target destination Place ID' })
  async getPlaceReviews(@Param('placeId') placeId: string) {
    return this.reviewsService.getPlaceReviews(placeId);
  }
}
