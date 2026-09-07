import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Place being reviewed',
  })
  @IsUUID('4')
  @IsNotEmpty()
  placeId!: string;

  @ApiProperty({
    description: 'Completed booking associated with the review',
  })
  @IsUUID('4')
  @IsNotEmpty()
  bookingId!: string;

  @ApiProperty({
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({
    minimum: 10,
    maximum: 500,
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 500)
  comment!: string;

  @ApiPropertyOptional({
    description: 'Review language',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  @Length(2, 5)
  lang?: string;
}
