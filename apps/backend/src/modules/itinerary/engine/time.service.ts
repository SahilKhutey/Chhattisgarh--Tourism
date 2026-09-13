import { Injectable } from '@nestjs/common';

@Injectable()
export class TravelTimeService {
  public static readonly ROAD_DISTANCE_FACTOR = 1.25;
  public static readonly DEFAULT_SPEED_KMH = 35;

  estimateMinutes(
    distanceKm: number,
    averageSpeedKmh = TravelTimeService.DEFAULT_SPEED_KMH,
  ): number {
    if (distanceKm < 0 || averageSpeedKmh <= 0) {
      throw new Error('Invalid travel parameters');
    }

    if (distanceKm === 0) {
      return 0;
    }

    const estimatedRoadDistance = distanceKm * TravelTimeService.ROAD_DISTANCE_FACTOR;
    return Math.ceil((estimatedRoadDistance / averageSpeedKmh) * 60);
  }

  distanceKm(
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number },
  ): number {
    const earthRadius = 6371;

    const dLat = this.toRadians(b.latitude - a.latitude);
    const dLon = this.toRadians(b.longitude - a.longitude);

    const lat1 = this.toRadians(a.latitude);
    const lat2 = this.toRadians(b.latitude);

    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

    const crowFlies = 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return Math.round(crowFlies * 100) / 100;
  }

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }
}
