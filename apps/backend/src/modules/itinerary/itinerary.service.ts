import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

type Pace = 'slow' | 'moderate' | 'active';

type Coordinates = {
  lat: number;
  lng: number;
};

type RecommendationCandidate = {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  bestSeason: string | null;
  rules: string | null;
  safetyInfo: string | null;
  categoryName: string;
  estimatedVisitMinutes: number;
  visitorCapacity: number | null;
  averageRating: number;
  reviewCount: number;
  popularity: number;
  safety: number;
  accessibility: number;
  mediaQuality: number;
  ecoSensitivity: number;
  interestMatch: number;
  recommendationScore: number;
  recommendationReason: string;
};

type ItineraryStop = {
  placeId: string;
  name: string;
  slug: string;
  coordinates: Coordinates;
  distanceFromPreviousKm: number;
  estimatedVisitMinutes: number;
  averageRating: number;
  reviewCount: number;
  recommendationScore: number;
  recommendationReason: string;
  bestSeasonInfo: string | null;
  safetyRules: string | null;
  safetyInfo: string | null;
  category: string;
};

type ItineraryDay = {
  day: number;
  stops: ItineraryStop[];
  distanceTraveledKm: number;
  estimatedVisitMinutes: number;
  estimatedDayMinutes: number;
};

@Injectable()
export class ItineraryService {
  constructor(private readonly prisma: PrismaService) {}

  async generateItinerary(
    district: string,
    durationDays: number,
    pace: Pace = 'moderate',
    interests: string[] = [],
    travelers = 1,
  ): Promise<ItineraryDay[]> {
    this.validateInput(district, durationDays, pace, travelers);

    const normalizedDistrict = district.trim();

    const places = await this.prisma.place.findMany({
      where: {
        district: {
          equals: normalizedDistrict,
          mode: 'insensitive',
        },
        verified: true,
        planningProfile: {
          planningEnabled: true,
        },
      },
      include: {
        category: true,
        planningProfile: true,
        reviews: {
          select: {
            rating: true,
          },
        },
        scores: true,
      },
    });

    if (places.length === 0) {
      return [];
    }

    const candidates = places
      .map((place) => this.createCandidate(place, interests))
      .filter((candidate) => this.isCapacityEligible(candidate, travelers));

    if (candidates.length === 0) {
      return Array.from({ length: durationDays }, (_, i) => ({
        day: i + 1,
        stops: [],
        distanceTraveledKm: 0,
        estimatedVisitMinutes: 0,
        estimatedDayMinutes: 0,
      }));
    }

    candidates.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return this.buildDailyItinerary(
      candidates,
      durationDays,
      pace,
      normalizedDistrict,
    );
  }

  private validateInput(
    district: string,
    durationDays: number,
    pace: Pace,
    travelers: number,
  ): void {
    if (!district?.trim()) {
      throw new BadRequestException('District is required.');
    }

    if (
      !Number.isInteger(durationDays) ||
      durationDays < 1 ||
      durationDays > 7
    ) {
      throw new BadRequestException(
        'Duration must be an integer between 1 and 7 days.',
      );
    }

    if (!['slow', 'moderate', 'active'].includes(pace)) {
      throw new BadRequestException('Pace must be slow, moderate, or active.');
    }

    if (!Number.isInteger(travelers) || travelers < 1 || travelers > 20) {
      throw new BadRequestException('Travelers must be between 1 and 20.');
    }
  }

  private createCandidate(
    place: any,
    interests: string[],
  ): RecommendationCandidate {
    const ratings = place.reviews.map(
      (review: { rating: number }) => review.rating,
    );

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) /
          ratings.length
        : 0;

    const score = place.scores;

    const popularity = this.clampScore(score?.popularity ?? 50);
    const safety = this.clampScore(score?.safety ?? 50);
    const accessibility = this.clampScore(score?.accessibility ?? 50);
    const mediaQuality = this.clampScore(score?.mediaQuality ?? 50);
    const ecoSensitivity = this.clampScore(score?.ecoSensitivity ?? 50);

    const categoryName = place.category?.name ?? 'Nature';

    const interestMatch = this.calculateInterestMatch(
      categoryName,
      place.experienceTypes,
      interests,
    );

    const reviewQuality =
      ratings.length > 0 ? (averageRating / 5) * 100 : 50;

    const recommendationScore =
      reviewQuality * 0.4 +
      interestMatch * 0.2 +
      popularity * 0.15 +
      safety * 0.1 +
      accessibility * 0.1 +
      mediaQuality * 0.05;

    return {
      id: place.id,
      name: place.name,
      slug: place.slug,
      latitude: place.latitude,
      longitude: place.longitude,
      bestSeason: place.bestSeason,
      rules: place.rules,
      safetyInfo: place.safetyInfo,
      categoryName,
      estimatedVisitMinutes:
        place.planningProfile?.estimatedVisitMinutes ?? 90,
      visitorCapacity: place.planningProfile?.visitorCapacity ?? null,
      averageRating: Math.round(averageRating * 100) / 100,
      reviewCount: ratings.length,
      popularity,
      safety,
      accessibility,
      mediaQuality,
      ecoSensitivity,
      interestMatch,
      recommendationScore: Math.round(recommendationScore * 100) / 100,
      recommendationReason: this.createRecommendationReason(
        interestMatch,
        averageRating,
        ratings.length,
        safety,
        accessibility,
      ),
    };
  }

  private calculateInterestMatch(
    categoryName: string,
    experienceTypesJson: string,
    interests: string[],
  ): number {
    if (!interests.length) {
      return 50;
    }

    const normalizedCategory = categoryName.toLowerCase();

    let experienceTypes: string[] = [];
    try {
      const parsed = JSON.parse(experienceTypesJson ?? '[]');
      if (Array.isArray(parsed)) {
        experienceTypes = parsed.map((item) => String(item).toLowerCase());
      }
    } catch {
      experienceTypes = [];
    }

    const normalizedInterests = interests.map((interest) =>
      interest.trim().toLowerCase(),
    );

    const matched = normalizedInterests.filter(
      (interest) =>
        normalizedCategory.includes(interest) ||
        experienceTypes.some((type) => type.includes(interest)),
    );

    if (matched.length === 0) {
      return 0;
    }

    return Math.min(100, 50 + matched.length * 25);
  }

  private createRecommendationReason(
    interestMatch: number,
    averageRating: number,
    reviewCount: number,
    safety: number,
    accessibility: number,
  ): string {
    const reasons: string[] = [];

    if (interestMatch >= 75) {
      reasons.push('Strong match for your interests');
    }

    if (averageRating >= 4 && reviewCount > 0) {
      reasons.push(`Rated ${averageRating.toFixed(1)}/5`);
    }

    if (safety >= 75) {
      reasons.push('Strong safety score');
    }

    if (accessibility >= 75) {
      reasons.push('Good accessibility score');
    }

    if (reasons.length === 0) {
      reasons.push('Recommended from verified tourism data');
    }

    return reasons.join(' · ');
  }

  private isCapacityEligible(
    candidate: RecommendationCandidate,
    travelers: number,
  ): boolean {
    if (candidate.visitorCapacity === null) {
      return false;
    }

    return candidate.visitorCapacity >= travelers;
  }

  private buildDailyItinerary(
    candidates: RecommendationCandidate[],
    durationDays: number,
    pace: Pace,
    district: string,
  ): ItineraryDay[] {
    const maxDistance = this.getMaximumDailyDistance(pace);
    const maxStops = this.getMaximumDailyStops(pace);
    const maxVisitMinutes = this.getMaximumDailyVisitMinutes(pace);
    const start = this.getDistrictStartPoint(district);

    const remaining = [...candidates];
    const itinerary: ItineraryDay[] = [];

    let current = start;

    for (let day = 1; day <= durationDays; day++) {
      const stops: ItineraryStop[] = [];
      let distance = 0;
      let visitMinutes = 0;

      while (remaining.length > 0 && stops.length < maxStops) {
        const nextIndex = this.findBestReachableCandidate(
          current,
          remaining,
          distance,
          visitMinutes,
          maxDistance,
          maxVisitMinutes,
        );

        if (nextIndex === -1) {
          break;
        }

        const [selected] = remaining.splice(nextIndex, 1);

        const distanceFromPrevious = this.calculateDistance(
          current.lat,
          current.lng,
          selected.latitude,
          selected.longitude,
        );

        distance += distanceFromPrevious;
        visitMinutes += selected.estimatedVisitMinutes;

        stops.push({
          placeId: selected.id,
          name: selected.name,
          slug: selected.slug,
          coordinates: {
            lat: selected.latitude,
            lng: selected.longitude,
          },
          distanceFromPreviousKm: this.round(distanceFromPrevious),
          estimatedVisitMinutes: selected.estimatedVisitMinutes,
          averageRating: selected.averageRating,
          reviewCount: selected.reviewCount,
          recommendationScore: selected.recommendationScore,
          recommendationReason: selected.recommendationReason,
          bestSeasonInfo: selected.bestSeason,
          safetyRules: selected.rules,
          safetyInfo: selected.safetyInfo,
          category: selected.categoryName,
        });

        current = {
          lat: selected.latitude,
          lng: selected.longitude,
        };
      }

      itinerary.push({
        day,
        stops,
        distanceTraveledKm: this.round(distance),
        estimatedVisitMinutes: visitMinutes,
        estimatedDayMinutes:
          visitMinutes + this.estimateTravelMinutes(distance),
      });
    }

    return itinerary;
  }

  private findBestReachableCandidate(
    current: Coordinates,
    candidates: RecommendationCandidate[],
    currentDistance: number,
    currentVisitMinutes: number,
    maxDistance: number,
    maxVisitMinutes: number,
  ): number {
    let bestIndex = -1;
    let bestUtility = -Infinity;

    candidates.forEach((candidate, index) => {
      const distance = this.calculateDistance(
        current.lat,
        current.lng,
        candidate.latitude,
        candidate.longitude,
      );

      const projectedDistance = currentDistance + distance;
      const projectedVisitMinutes =
        currentVisitMinutes + candidate.estimatedVisitMinutes;

      if (projectedDistance > maxDistance) {
        return;
      }

      if (projectedVisitMinutes > maxVisitMinutes) {
        return;
      }

      const distancePenalty = Math.min(30, distance * 0.35);
      const utility = candidate.recommendationScore - distancePenalty;

      if (utility > bestUtility) {
        bestUtility = utility;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  private getMaximumDailyDistance(pace: Pace): number {
    switch (pace) {
      case 'slow':
        return 30;
      case 'active':
        return 150;
      default:
        return 70;
    }
  }

  private getMaximumDailyStops(pace: Pace): number {
    switch (pace) {
      case 'slow':
        return 2;
      case 'active':
        return 5;
      default:
        return 3;
    }
  }

  private getMaximumDailyVisitMinutes(pace: Pace): number {
    switch (pace) {
      case 'slow':
        return 360;
      case 'active':
        return 540;
      default:
        return 450;
    }
  }

  private getDistrictStartPoint(district: string): Coordinates {
    const starts: Record<string, Coordinates> = {
      Bastar: { lat: 19.076, lng: 82.0253 },
      Surguja: { lat: 23.1189, lng: 83.195 },
      Raipur: { lat: 21.2514, lng: 81.6296 },
      Bilaspur: { lat: 22.0796, lng: 82.1391 },
      Dantewada: { lat: 18.8966, lng: 81.3524 },
    };

    return starts[district] ?? { lat: 21.2514, lng: 81.6296 };
  }

  private estimateTravelMinutes(distanceKm: number): number {
    const averageSpeedKmH = 30;
    return Math.round((distanceKm / averageSpeedKmH) * 60);
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const earthRadiusKm = 6371;

    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
  }

  private deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private clampScore(value: number): number {
    return Math.max(0, Math.min(100, value));
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
