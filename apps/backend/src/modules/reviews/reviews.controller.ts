import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Reviews & Feedback')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Submit a verified destination review',
  })
  async createReview(@Request() req: any, @Body() dto: CreateReviewDto) {
    const userId = req.user?.id || req.user?.userId;
    return this.reviewsService.createReview(userId, dto);
  }

  @Get('place/:placeId')
  @ApiOperation({
    summary: 'Retrieve destination review feed and rating summary',
  })
  @ApiParam({
    name: 'placeId',
    type: String,
  })
  async getPlaceReviews(@Param('placeId') placeId: string) {
    return this.reviewsService.getPlaceReviews(placeId);
  }
}
