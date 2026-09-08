import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Coordinates, GeoValidationResult, HierarchyValidationReport } from './geography.types';

export function isValidCoordinates(coordinates: Coordinates): boolean {
  if (!coordinates) return false;
  return (
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude) &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  );
}

export function isInsideChhattisgarhBounds(coordinates: Coordinates): boolean {
  if (!isValidCoordinates(coordinates)) return false;
  // Bounding box for Chhattisgarh state
  return (
    coordinates.latitude >= 17.5 &&
    coordinates.latitude <= 24.5 &&
    coordinates.longitude >= 80.0 &&
    coordinates.longitude <= 84.8
  );
}

@Injectable()
export class GeographyService {
  constructor(private readonly prisma: PrismaService) {}

  validateCoordinates(coordinates: Coordinates): boolean {
    return isValidCoordinates(coordinates);
  }

  isWithinRegionalBounds(coordinates: Coordinates): boolean {
    return isInsideChhattisgarhBounds(coordinates);
  }

  async validatePlaceCoordinates(placeId: string): Promise<GeoValidationResult | null> {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        district: true,
      },
    });

    if (!place) return null;

    const coords: Coordinates = {
      latitude: place.latitude,
      longitude: place.longitude,
    };

    const errors: string[] = [];
    if (!isValidCoordinates(coords)) {
      errors.push('Invalid coordinate numbers or out of global range');
    }
    const insideState = isInsideChhattisgarhBounds(coords);
    if (!insideState) {
      errors.push('Coordinates outside Chhattisgarh state geographical bounds');
    }
    if (!place.district || place.district.trim() === '') {
      errors.push('Missing district administrative linkage');
    }

    return {
      placeId: place.id,
      name: place.name,
      valid: errors.length === 0,
      errors,
      coordinates: coords,
      insideStateBounds: insideState,
    };
  }

  async auditAllPlaces(): Promise<HierarchyValidationReport> {
    const places = await this.prisma.place.findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        district: true,
      },
    });

    const results: GeoValidationResult[] = places.map((place) => {
      const coords: Coordinates = {
        latitude: place.latitude,
        longitude: place.longitude,
      };
      const errors: string[] = [];
      if (!isValidCoordinates(coords)) {
        errors.push('Invalid coordinate numbers');
      }
      const inside = isInsideChhattisgarhBounds(coords);
      if (!inside) {
        errors.push('Outside regional boundary');
      }
      if (!place.district) {
        errors.push('Missing district');
      }

      return {
        placeId: place.id,
        name: place.name,
        valid: errors.length === 0,
        errors,
        coordinates: coords,
        insideStateBounds: inside,
      };
    });

    const validCount = results.filter((r) => r.valid).length;

    return {
      totalPlaces: results.length,
      validPlaces: validCount,
      invalidPlaces: results.length - validCount,
      details: results,
    };
  }
}
