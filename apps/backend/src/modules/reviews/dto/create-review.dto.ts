import { IsUUID, IsNotEmpty, IsInt, Min, Max, IsString, Length, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsUUID('4', { message: 'Place ID must be a valid UUID.' })
  @IsNotEmpty({ message: 'Place ID is required to leave reviews.' })
  placeId: string;

  @IsInt({ message: 'Rating must be an integer.' })
  @Min(1, { message: 'Rating must be at least 1 star.' })
  @Max(5, { message: 'Rating cannot exceed 5 stars.' })
  rating: number;

  @IsString({ message: 'Review comment must be a string.' })
  @IsNotEmpty({ message: 'Review comment cannot be empty.' })
  @Length(10, 500, { message: 'Review comment must be between 10 and 500 characters long.' })
  comment: string;

  @IsString({ message: 'Language code must be a string.' })
  @Length(2, 5, { message: 'Language code must be 2 to 5 characters long.' })
  @IsOptional()
  lang?: string;
}
