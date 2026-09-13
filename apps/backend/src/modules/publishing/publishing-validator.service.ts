import { BadRequestException, Injectable } from '@nestjs/common';
import { isInsideChhattisgarhBounds, isValidCoordinates } from '../geography/geography.service';

export interface PlaceValidationInput {
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  categories: unknown[];
  description?: string | null;
}

@Injectable()
export class PublishingValidatorService {
  validatePlace(place: PlaceValidationInput): boolean {
    const errors: string[] = [];

    if (!place.name?.trim()) {
      errors.push('Place name is required');
    }

    if (!place.slug?.trim()) {
      errors.push('Place slug is required');
    }

    if (
      typeof place.latitude !== 'number' ||
      !Number.isFinite(place.latitude) ||
      place.latitude < -90 ||
      place.latitude > 90
    ) {
      errors.push('Invalid latitude');
    }

    if (
      typeof place.longitude !== 'number' ||
      !Number.isFinite(place.longitude) ||
      place.longitude < -180 ||
      place.longitude > 180
    ) {
      errors.push('Invalid longitude');
    }

    if (
      Number.isFinite(place.latitude) &&
      Number.isFinite(place.longitude) &&
      !isInsideChhattisgarhBounds({
        latitude: place.latitude,
        longitude: place.longitude,
      })
    ) {
      errors.push('Coordinates outside Chhattisgarh regional boundary');
    }

    if (!place.categories?.length) {
      errors.push('At least one category is required');
    }

    if (!place.description?.trim()) {
      errors.push('Description is required');
    }

    if (errors.length > 0) {
      throw new BadRequestException(
        `Place cannot be published: ${errors.join(', ')}`,
      );
    }

    return true;
  }
}
