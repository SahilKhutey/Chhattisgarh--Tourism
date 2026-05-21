import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ItineraryService {
  constructor(private readonly prisma: PrismaService) {}

  async generateItinerary(
    district: string,
    durationDays: number,
    pace: 'slow' | 'moderate' | 'active' = 'moderate',
  ) {
    if (durationDays < 1 || durationDays > 7) {
      throw new BadRequestException('Duration must be between 1 and 7 days.');
    }

    // 1. Fetch verified places in the targeted district
    const places = await this.prisma.place.findMany({
      where: {
        verified: true,
        district: {
          equals: district,
        },
      },
    });

    if (places.length === 0) {
      return [];
    }

    // 2. Filter by ecological capacity (simulated check since load fields are local mock parameters)
    const safePlaces = places.filter(place => {
      const maxCapacity = 500;
      const currentLoad = (place.name.length * 17) % 450; 
      return currentLoad < maxCapacity;
    });

    if (safePlaces.length === 0) {
      return [];
    }

    // 3. Sort by priority score (calculate mock rating based on name metrics)
    const scoredPlaces = safePlaces.map(place => {
      const rating = 4.0 + ((place.name.length % 11) / 10);
      return { ...place, rating };
    });
    scoredPlaces.sort((a, b) => b.rating - a.rating);

    const itinerary = [];
    const visited = new Set<string>();
    let currentCoordinates = { lat: 21.2787, lng: 81.8661 }; // Start at Raipur coordinates

    for (let day = 1; day <= durationDays; day++) {
      const dayStops = [];
      const maxDailyDistance = pace === 'slow' ? 30.0 : pace === 'moderate' ? 70.0 : 150.0;
      let dailyTravelKm = 0.0;

      while (dailyTravelKm < maxDailyDistance && dayStops.length < 3) {
        const nextPlace = this.findNearestUnvisited(currentCoordinates, scoredPlaces, visited);
        if (!nextPlace) {
          break;
        }

        const dist = this.calculateDistance(
          currentCoordinates.lat,
          currentCoordinates.lng,
          nextPlace.latitude,
          nextPlace.longitude,
        );

        if (dailyTravelKm + dist > maxDailyDistance && dayStops.length > 0) {
          break;
        }

        visited.add(nextPlace.id);
        dayStops.push({
          name: nextPlace.name,
          slug: nextPlace.slug,
          coordinates: { lat: nextPlace.latitude, lng: nextPlace.longitude },
          bestSeasonInfo: nextPlace.bestSeason,
          safetyRules: nextPlace.rules,
        });

        dailyTravelKm += dist;
        currentCoordinates = { lat: nextPlace.latitude, lng: nextPlace.longitude };
      }

      itinerary.push({
        day,
        stops: dayStops,
        distanceTraveledKm: Math.round(dailyTravelKm * 100) / 100,
      });
    }

    return itinerary;
  }

  private findNearestUnvisited(
    current: { lat: number; lng: number },
    places: any[],
    visited: Set<string>,
  ) {
    let nearest = null;
    let minDist = Infinity;
    for (const p of places) {
      if (visited.has(p.id)) {
        continue;
      }
      const dist = this.calculateDistance(current.lat, current.lng, p.latitude, p.longitude);
      if (dist < minDist) {
        minDist = dist;
        nearest = p;
      }
    }
    return nearest;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371.0;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
