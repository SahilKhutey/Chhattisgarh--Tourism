import { Injectable, BadRequestException } from '@nestjs/common';
import { Coordinates } from '../geo.types';

@Injectable()
export class DistanceService {
  validateCoordinates(point: Coordinates): void {
    if (
      point.latitude === null ||
      point.latitude === undefined ||
      point.longitude === null ||
      point.longitude === undefined ||
      !Number.isFinite(point.latitude) ||
      !Number.isFinite(point.longitude)
    ) {
      throw new BadRequestException(
        'Latitude and longitude must be valid numbers',
      );
    }

    if (point.latitude < -90 || point.latitude > 90) {
      throw new BadRequestException(
        'Latitude must be between -90 and 90',
      );
    }

    if (point.longitude < -180 || point.longitude > 180) {
      throw new BadRequestException(
        'Longitude must be between -180 and 180',
      );
    }
  }

  haversineMeters(a: Coordinates, b: Coordinates): number {
    this.validateCoordinates(a);
    this.validateCoordinates(b);

    const earthRadius = 6_371_008.8;

    const lat1 = this.toRadians(a.latitude);
    const lat2 = this.toRadians(b.latitude);

    const deltaLat = this.toRadians(b.latitude - a.latitude);
    const deltaLon = this.toRadians(b.longitude - a.longitude);

    const h =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

    return 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }
}
