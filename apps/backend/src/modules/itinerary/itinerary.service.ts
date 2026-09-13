import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ItineraryRepository } from './itinerary.repository';
import { PlanningEngineService } from './engine/planning-engine.service';
import { ItineraryCacheService } from './cache/itinerary-cache.service';
import { DefaultAiPlannerService } from './ai/ai-planner.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { PlanItineraryDto } from './dto/plan-itinerary.dto';
import { ReorderStopDto } from './dto/reorder-stop.dto';
import { RegenerateDayDto } from './dto/regenerate-day.dto';
import { GeneratedItinerary, PlanningPace } from './engine/planner.types';

type LegacyPace = 'slow' | 'moderate' | 'active';

@Injectable()
export class ItineraryService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly repository?: ItineraryRepository,
    @Optional() private readonly engine?: PlanningEngineService,
    @Optional() private readonly cache?: ItineraryCacheService,
    @Optional() private readonly aiPlanner?: DefaultAiPlannerService,
    @Optional() private readonly analytics?: AnalyticsService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PHASE 4: CANONICAL TRIP PLANNING API
  // ─────────────────────────────────────────────────────────────────────────────

  async createTrip(dto: CreateTripDto, userId?: string) {
    if (!this.repository) throw new Error('Repository unavailable');

    const trip = await this.repository.createTrip(dto, userId);

    if (this.analytics) {
      await this.analytics.track({
        type: 'PAGE_VIEW' as any,
        name: 'trip_created',
        userId,
        metadata: { tripId: trip.id, travelers: trip.travelers },
      });
    }

    return trip;
  }

  async getTrip(tripId: string, userId?: string) {
    if (!this.repository) throw new Error('Repository unavailable');

    const cached = await this.cache?.get<any>(`trip:${tripId}:full`);
    if (cached) {
      this.checkTripOwnership(cached, userId);
      return cached;
    }

    const trip = await this.repository.getTrip(tripId);
    this.checkTripOwnership(trip, userId);

    await this.cache?.set(`trip:${tripId}:full`, trip, 300);
    return trip;
  }

  async generateForTrip(tripId: string, dto?: PlanItineraryDto, userId?: string) {
    if (!this.repository || !this.engine) throw new Error('Planner engine unavailable');

    const trip = await this.repository.getTrip(tripId);
    this.checkTripOwnership(trip, userId);

    const candidates = await this.repository.findCandidates(trip, dto);

    const pace: PlanningPace = (dto?.pace || trip.preferences?.pace || 'BALANCED') as PlanningPace;
    const origin =
      trip.originLatitude && trip.originLongitude
        ? { latitude: Number(trip.originLatitude), longitude: Number(trip.originLongitude) }
        : undefined;

    const generated = this.engine.generate(candidates, {
      tripId,
      startDate: trip.startDate,
      endDate: trip.endDate,
      travelers: trip.travelers,
      origin,
      pace,
      categories: dto?.categories ?? (trip.preferences?.categories as string[]) ?? [],
      maxDailyTravelMin: dto?.maxDailyTravelMin,
      accessibilityRequired: dto?.accessibilityRequired ?? trip.preferences?.accessibility ?? false,
      requiredPlaceIds: dto?.requiredPlaceIds ?? (trip.constraints?.requiredPlaceIds as string[]) ?? [],
      excludedPlaceIds: dto?.excludedPlaceIds ?? (trip.constraints?.excludedPlaceIds as string[]) ?? [],
      budgetAmount: dto?.budgetAmount ?? (trip.constraints?.budgetAmount ? Number(trip.constraints.budgetAmount) : undefined),
    });

    const saved = await this.repository.saveGeneratedItinerary(tripId, generated);
    await this.cache?.invalidateTrip(tripId);

    if (this.analytics) {
      await this.analytics.track({
        type: 'PAGE_VIEW' as any,
        name: 'planning_generated',
        userId,
        metadata: { tripId, itineraryId: saved.id, days: generated.days.length },
      });
    }

    return saved;
  }

  async reorderStop(tripId: string, dto: ReorderStopDto, userId?: string) {
    if (!this.repository) throw new Error('Repository unavailable');

    const trip = await this.repository.getTrip(tripId);
    this.checkTripOwnership(trip, userId);

    const latestItinerary = trip.itineraries?.[0];
    if (!latestItinerary) {
      throw new NotFoundException('No active itinerary exists for this trip');
    }

    const updated = await this.repository.reorderStop(
      tripId,
      latestItinerary.id,
      dto.stopId,
      dto.targetDaySequence,
      dto.targetStopSequence,
    );

    await this.cache?.invalidateTrip(tripId);
    return updated;
  }

  async regenerateDay(tripId: string, dto: RegenerateDayDto, userId?: string) {
    if (!this.repository || !this.engine) throw new Error('Planner engine unavailable');

    const trip = await this.repository.getTrip(tripId);
    this.checkTripOwnership(trip, userId);

    const latestItinerary = trip.itineraries?.[0];
    if (!latestItinerary) {
      throw new NotFoundException('No active itinerary exists for this trip');
    }

    // Build map of locked stops
    const lockedStopsByDay = new Map<number, any[]>();
    latestItinerary.days.forEach((day) => {
      const dayStops = day.stops
        .filter((s) => (dto.lockedStopIds ? dto.lockedStopIds.includes(s.id) : s.isLocked))
        .map((s) => ({
          ...s,
          isLocked: true,
          placeId: s.placeId,
          experienceId: s.experienceId ?? undefined,
          name: s.place.name,
          slug: s.place.slug,
          latitude: s.place.latitude,
          longitude: s.place.longitude,
          estimatedCost: s.estimatedCost ? Number(s.estimatedCost) : 0,
        }));
      if (dayStops.length > 0) {
        lockedStopsByDay.set(day.sequence, dayStops);
      }
    });

    const candidates = await this.repository.findCandidates(trip);
    const pace: PlanningPace = (trip.preferences?.pace || 'BALANCED') as PlanningPace;
    const origin =
      trip.originLatitude && trip.originLongitude
        ? { latitude: Number(trip.originLatitude), longitude: Number(trip.originLongitude) }
        : undefined;

    const generated = this.engine.generate(
      candidates,
      {
        tripId,
        startDate: trip.startDate,
        endDate: trip.endDate,
        travelers: trip.travelers,
        origin,
        pace,
        categories: (trip.preferences?.categories as string[]) ?? [],
        accessibilityRequired: trip.preferences?.accessibility ?? false,
      },
      lockedStopsByDay,
    );

    const saved = await this.repository.saveGeneratedItinerary(tripId, generated);
    await this.cache?.invalidateTrip(tripId);
    return saved;
  }

  async getUserTrips(userId: string) {
    if (!this.repository) throw new Error('Repository unavailable');
    return this.repository.getUserTrips(userId);
  }

  async deleteTrip(tripId: string, userId?: string) {
    if (!this.repository) throw new Error('Repository unavailable');
    const trip = await this.repository.getTrip(tripId);
    this.checkTripOwnership(trip, userId);

    const deleted = await this.repository.deleteTrip(tripId);
    await this.cache?.invalidateTrip(tripId);
    return deleted;
  }

  async explainItinerary(tripId: string, userId?: string) {
    const trip = await this.getTrip(tripId, userId);
    const latest = trip.itineraries?.[0];
    if (!latest) throw new NotFoundException('No active itinerary');

    if (!this.aiPlanner) {
      return 'Explore Chhattisgarh destinations according to your configured schedule.';
    }

    const generated: GeneratedItinerary = {
      status: 'READY',
      totalDistanceKm: Number(latest.totalDistanceKm ?? 0),
      totalDurationMin: latest.totalDurationMin ?? 0,
      estimatedCost: Number(latest.estimatedCost ?? 0),
      days: latest.days.map((d: any) => ({
        date: d.date.toISOString().split('T')[0],
        sequence: d.sequence,
        startTime: d.startTime ?? '09:00',
        endTime: d.endTime ?? '18:00',
        distanceKm: 0,
        travelMinutes: 0,
        visitMinutes: 0,
        estimatedCost: 0,
        stops: d.stops.map((s: any) => ({
          placeId: s.placeId,
          name: s.place.name,
          slug: s.place.slug,
          latitude: s.place.latitude,
          longitude: s.place.longitude,
          sequence: s.sequence,
          arrivalTime: s.arrivalTime ?? '',
          departureTime: s.departureTime ?? '',
          travelFromPreviousMin: s.travelFromPreviousMin ?? 0,
          visitDurationMin: s.visitDurationMin ?? 90,
          estimatedCost: Number(s.estimatedCost ?? 0),
          reason: s.reason ?? '',
          isLocked: s.isLocked,
        })),
      })),
    };

    return this.aiPlanner.explain(generated);
  }

  private checkTripOwnership(trip: { userId?: string | null }, currentUserId?: string) {
    if (trip.userId && currentUserId && trip.userId !== currentUserId) {
      throw new ForbiddenException('Access denied: You do not own this trip');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LEGACY BACKWARD COMPATIBILITY METHOD (Preserved for existing test suites)
  // ─────────────────────────────────────────────────────────────────────────────

  async generateItinerary(
    district: string,
    durationDays: number,
    pace: LegacyPace = 'moderate',
    interests: string[] = [],
    travelers = 1,
  ): Promise<any[]> {
    this.validateLegacyInput(district, durationDays, pace, travelers);

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
      .map((place) => this.createLegacyCandidate(place, interests))
      .filter((candidate) => this.isLegacyCapacityEligible(candidate, travelers));

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

    return this.buildLegacyDailyItinerary(
      candidates,
      durationDays,
      pace,
      normalizedDistrict,
    );
  }

  private validateLegacyInput(
    district: string,
    durationDays: number,
    pace: LegacyPace,
    travelers: number,
  ): void {
    if (!district?.trim()) {
      throw new BadRequestException('District is required.');
    }

    if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 7) {
      throw new BadRequestException('Duration must be an integer between 1 and 7 days.');
    }

    if (!['slow', 'moderate', 'active'].includes(pace)) {
      throw new BadRequestException('Pace must be slow, moderate, or active.');
    }

    if (!Number.isInteger(travelers) || travelers < 1 || travelers > 20) {
      throw new BadRequestException('Travelers must be between 1 and 20.');
    }
  }

  private createLegacyCandidate(place: any, interests: string[]): any {
    const ratings = place.reviews.map((review: { rating: number }) => review.rating);
    const averageRating =
      ratings.length > 0 ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length : 0;

    const score = place.scores;
    const popularity = this.clamp(score?.popularity ?? 50);
    const safety = this.clamp(score?.safety ?? 50);
    const accessibility = this.clamp(score?.accessibility ?? 50);
    const mediaQuality = this.clamp(score?.mediaQuality ?? 50);
    const ecoSensitivity = this.clamp(score?.ecoSensitivity ?? 50);

    const categoryName = place.category?.name ?? 'Nature';
    const interestMatch = this.calculateLegacyInterestMatch(
      categoryName,
      place.experienceTypes,
      interests,
    );

    const reviewQuality = ratings.length > 0 ? (averageRating / 5) * 100 : 50;

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
      estimatedVisitMinutes: place.planningProfile?.estimatedVisitMinutes ?? 90,
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
      recommendationReason: this.createLegacyReason(
        interestMatch,
        averageRating,
        ratings.length,
        safety,
        accessibility,
      ),
    };
  }

  private calculateLegacyInterestMatch(
    categoryName: string,
    experienceTypesJson: string,
    interests: string[],
  ): number {
    if (!interests.length) return 50;
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

    const normalizedInterests = interests.map((interest) => interest.trim().toLowerCase());
    const matched = normalizedInterests.filter(
      (interest) =>
        normalizedCategory.includes(interest) ||
        experienceTypes.some((type) => type.includes(interest)),
    );

    if (matched.length === 0) return 0;
    return Math.min(100, 50 + matched.length * 25);
  }

  private createLegacyReason(
    interestMatch: number,
    averageRating: number,
    reviewCount: number,
    safety: number,
    accessibility: number,
  ): string {
    const reasons: string[] = [];
    if (interestMatch >= 75) reasons.push('Strong match for your interests');
    if (averageRating >= 4 && reviewCount > 0) reasons.push(`Rated ${averageRating.toFixed(1)}/5`);
    if (safety >= 75) reasons.push('Strong safety score');
    if (accessibility >= 75) reasons.push('Good accessibility score');
    if (reasons.length === 0) reasons.push('Recommended from verified tourism data');
    return reasons.join(' · ');
  }

  private isLegacyCapacityEligible(candidate: any, travelers: number): boolean {
    if (candidate.visitorCapacity === null) return false;
    return candidate.visitorCapacity >= travelers;
  }

  private buildLegacyDailyItinerary(
    candidates: any[],
    durationDays: number,
    pace: LegacyPace,
    district: string,
  ): any[] {
    const maxDistance = pace === 'slow' ? 30 : pace === 'active' ? 150 : 70;
    const maxStops = pace === 'slow' ? 2 : pace === 'active' ? 5 : 3;
    const maxVisitMinutes = pace === 'slow' ? 360 : pace === 'active' ? 540 : 450;
    const start = this.getDistrictStart(district);

    const remaining = [...candidates];
    const itinerary: any[] = [];
    let current = start;

    for (let day = 1; day <= durationDays; day++) {
      const stops: any[] = [];
      let distance = 0;
      let visitMinutes = 0;

      while (remaining.length > 0 && stops.length < maxStops) {
        let bestIndex = -1;
        let bestUtility = -Infinity;

        remaining.forEach((candidate, index) => {
          const d = this.legacyDist(current.lat, current.lng, candidate.latitude, candidate.longitude);
          if (distance + d > maxDistance || visitMinutes + candidate.estimatedVisitMinutes > maxVisitMinutes) {
            return;
          }
          const utility = candidate.recommendationScore - Math.min(30, d * 0.35);
          if (utility > bestUtility) {
            bestUtility = utility;
            bestIndex = index;
          }
        });

        if (bestIndex === -1) break;

        const [selected] = remaining.splice(bestIndex, 1);
        const d = this.legacyDist(current.lat, current.lng, selected.latitude, selected.longitude);
        distance += d;
        visitMinutes += selected.estimatedVisitMinutes;

        stops.push({
          placeId: selected.id,
          name: selected.name,
          slug: selected.slug,
          coordinates: { lat: selected.latitude, lng: selected.longitude },
          distanceFromPreviousKm: Math.round(d * 100) / 100,
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

        current = { lat: selected.latitude, lng: selected.longitude };
      }

      itinerary.push({
        day,
        stops,
        distanceTraveledKm: Math.round(distance * 100) / 100,
        estimatedVisitMinutes: visitMinutes,
        estimatedDayMinutes: visitMinutes + Math.round((distance / 30) * 60),
      });
    }

    return itinerary;
  }

  private getDistrictStart(district: string): { lat: number; lng: number } {
    const starts: Record<string, { lat: number; lng: number }> = {
      Bastar: { lat: 19.076, lng: 82.0253 },
      Surguja: { lat: 23.1189, lng: 83.195 },
      Raipur: { lat: 21.2514, lng: 81.6296 },
      Bilaspur: { lat: 22.0796, lng: 82.1391 },
      Dantewada: { lat: 18.8966, lng: 81.3524 },
    };
    return starts[district] ?? { lat: 21.2514, lng: 81.6296 };
  }

  private legacyDist(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private clamp(val: number): number {
    return Math.max(0, Math.min(100, val));
  }
}
