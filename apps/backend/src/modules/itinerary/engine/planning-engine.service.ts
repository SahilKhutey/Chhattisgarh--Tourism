import { Injectable, BadRequestException } from '@nestjs/common';
import { FeasibilityService } from './feasibility.service';
import { PlanningScoringService } from './scoring.service';
import { SequencingService } from './sequencing.service';
import { TravelTimeService } from './time.service';
import { ExplanationService } from './explanation.service';
import {
  GeneratedDay,
  GeneratedItinerary,
  GeneratedStop,
  PlanningCandidate,
  PlanningPace,
  PlanningRequest,
  ScoredCandidate,
} from './planner.types';

interface PaceConfig {
  maxStopsPerDay: number;
  maxDayMinutes: number;
  visitBufferMin: number;
  travelBufferMin: number;
  defaultStartHour: number;
}

const PACE_CONFIGS: Record<PlanningPace, PaceConfig> = {
  RELAXED: {
    maxStopsPerDay: 2,
    maxDayMinutes: 420, // 7 hours
    visitBufferMin: 45,
    travelBufferMin: 25,
    defaultStartHour: 9,
  },
  BALANCED: {
    maxStopsPerDay: 4,
    maxDayMinutes: 540, // 9 hours
    visitBufferMin: 30,
    travelBufferMin: 15,
    defaultStartHour: 9,
  },
  FAST: {
    maxStopsPerDay: 5,
    maxDayMinutes: 660, // 11 hours
    visitBufferMin: 15,
    travelBufferMin: 10,
    defaultStartHour: 8,
  },
};

@Injectable()
export class PlanningEngineService {
  constructor(
    private readonly feasibility: FeasibilityService,
    private readonly scoring: PlanningScoringService,
    private readonly sequencing: SequencingService,
    private readonly timeService: TravelTimeService,
    private readonly explanation: ExplanationService,
  ) {}

  generate(
    candidates: PlanningCandidate[],
    request: PlanningRequest,
    lockedStopsByDay?: Map<number, GeneratedStop[]>,
  ): GeneratedItinerary {
    // 1. Calculate duration in days
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationDays = Math.max(1, Math.min(7, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1));

    const pace = request.pace || 'BALANCED';
    const paceConfig = PACE_CONFIGS[pace] || PACE_CONFIGS.BALANCED;
    const maxDailyTravel = request.maxDailyTravelMin ?? paceConfig.maxDayMinutes;
    const totalBudget = request.budgetAmount ?? Number.MAX_SAFE_INTEGER;
    const dailyBudget = totalBudget / durationDays;

    const excludedSet = new Set<string>(request.excludedPlaceIds ?? []);
    const requiredSet = new Set<string>(request.requiredPlaceIds ?? []);

    // 2. Feasibility filtering
    const eligible = candidates.filter((candidate) => {
      // Required places always pass basic filtering unless unpublished or wrong coords
      if (requiredSet.has(candidate.placeId)) {
        return (
          candidate.isPublished &&
          candidate.isPublic &&
          candidate.latitude >= 17.5 &&
          candidate.latitude <= 24.5 &&
          candidate.longitude >= 80.0 &&
          candidate.longitude <= 84.8
        );
      }

      return this.feasibility.isEligible(candidate, {
        remainingBudget: totalBudget,
        remainingMinutes: maxDailyTravel,
        accessibilityRequired: request.accessibilityRequired ?? false,
        excludedPlaceIds: excludedSet,
      });
    });

    if (eligible.length === 0) {
      throw new BadRequestException({
        code: 'NO_FEASIBLE_ITINERARY',
        message: 'No itinerary satisfies the selected constraints.',
        alternatives: [
          'Increase available time or duration',
          'Increase budget limit',
          'Relax category or accessibility requirements',
        ],
      });
    }

    // Default origin: Raipur (capital) if not provided
    const origin = request.origin ?? { latitude: 21.2514, longitude: 81.6296 };

    // 3. Candidate Scoring (Deterministic, fact-based)
    const normalizedCategories = (request.categories ?? []).map((c) => c.toLowerCase());

    const scoredCandidates: ScoredCandidate[] = eligible.map((candidate) => {
      // A. Preference match (0..1)
      let preferenceMatch = 0.5; // neutral fallback
      if (normalizedCategories.length > 0) {
        const candidateCategories = candidate.categoryIds.map((c) => c.toLowerCase());
        const matchCount = normalizedCategories.filter((reqCat) =>
          candidateCategories.some((candCat) => candCat.includes(reqCat) || reqCat.includes(candCat)),
        ).length;
        preferenceMatch = Math.min(1, matchCount / normalizedCategories.length);
      }

      // B. Geographic efficiency (0..1) - distance from origin
      const distFromOrigin = this.timeService.distanceKm(origin, candidate);
      const geographicEfficiency = Math.max(0, Math.min(1, 1 - distFromOrigin / 300));

      // C. Experience quality (0..1)
      const experienceQuality = candidate.rating > 0 ? candidate.rating / 5 : 0.6;

      // D. Time compatibility (0..1)
      const timeCompatibility = Math.max(0, Math.min(1, 1 - candidate.visitDurationMin / maxDailyTravel));

      // E. Budget compatibility (0..1)
      const budgetCompatibility =
        dailyBudget < Number.MAX_SAFE_INTEGER
          ? Math.max(0, Math.min(1, 1 - candidate.estimatedCost / dailyBudget))
          : 0.9;

      const breakdown = {
        preferenceMatch,
        geographicEfficiency,
        experienceQuality,
        timeCompatibility,
        budgetCompatibility,
      };

      // Bonus boost for explicitly required places
      const baseScore = this.scoring.score(breakdown);
      const finalScore = requiredSet.has(candidate.placeId) ? baseScore + 10.0 : baseScore;

      return {
        candidate,
        score: finalScore,
        scoreBreakdown: breakdown,
        reason: '',
      };
    });

    // 4. Sort deterministically by final score descending, breaking ties by name
    scoredCandidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.candidate.name.localeCompare(b.candidate.name);
    });

    // 5. Day Packing and Geographic Sequencing
    const availablePool = [...scoredCandidates];
    const generatedDays: GeneratedDay[] = [];
    let overallDistanceKm = 0;
    let overallDurationMin = 0;
    let overallCost = 0;

    let dayOrigin = origin;

    for (let dayIndex = 0; dayIndex < durationDays; dayIndex++) {
      const dayNumber = dayIndex + 1;
      const dayDate = new Date(start);
      dayDate.setDate(dayDate.getDate() + dayIndex);
      const dateString = dayDate.toISOString().split('T')[0];

      const stops: GeneratedStop[] = [];
      let dayDistanceKm = 0;
      let dayTravelMin = 0;
      let dayVisitMin = 0;
      let dayCost = 0;

      // Handle locked stops if this is a regeneration
      const lockedStops = lockedStopsByDay?.get(dayNumber) ?? [];
      const lockedPlaceIds = new Set(lockedStops.map((s) => s.placeId));

      // Remove locked places from available pool
      for (let i = availablePool.length - 1; i >= 0; i--) {
        if (lockedPlaceIds.has(availablePool[i].candidate.placeId)) {
          availablePool.splice(i, 1);
        }
      }

      // Add locked stops first if existing
      lockedStops.forEach((locked) => {
        stops.push(locked);
        dayCost += locked.estimatedCost;
        dayVisitMin += locked.visitDurationMin;
        dayTravelMin += locked.travelFromPreviousMin;
      });

      let currentLoc = stops.length > 0 ? stops[stops.length - 1] : dayOrigin;
      let currentHour = paceConfig.defaultStartHour;
      let currentMinute = 0;

      while (availablePool.length > 0 && stops.length < paceConfig.maxStopsPerDay) {
        // Find best next stop using greedy nearest neighbor among top candidates
        const candidateWindow = availablePool.slice(0, Math.min(8, availablePool.length));
        let bestCandidateIndex = 0;
        let bestDistance = Infinity;

        candidateWindow.forEach((item, idx) => {
          const dist = this.timeService.distanceKm(currentLoc, item.candidate);
          if (dist < bestDistance) {
            bestDistance = dist;
            bestCandidateIndex = idx;
          }
        });

        const [selected] = availablePool.splice(bestCandidateIndex, 1);
        const distanceKm = this.timeService.distanceKm(currentLoc, selected.candidate);
        const travelMin = this.timeService.estimateMinutes(distanceKm);
        const visitMin = selected.candidate.visitDurationMin || 90;

        // Check if adding this stop exceeds daily time limits
        if (
          stops.length > 0 &&
          dayTravelMin + travelMin + dayVisitMin + visitMin > paceConfig.maxDayMinutes
        ) {
          // Put back candidate for subsequent day
          availablePool.unshift(selected);
          break;
        }

        // Timing calculations
        const arrivalTotalMin = currentHour * 60 + currentMinute + travelMin;
        const arrivalH = Math.floor(arrivalTotalMin / 60);
        const arrivalM = arrivalTotalMin % 60;
        const arrivalTime = `${String(arrivalH).padStart(2, '0')}:${String(arrivalM).padStart(2, '0')}`;

        const departureTotalMin = arrivalTotalMin + visitMin;
        const depH = Math.floor(departureTotalMin / 60);
        const depM = departureTotalMin % 60;
        const departureTime = `${String(depH).padStart(2, '0')}:${String(depM).padStart(2, '0')}`;

        // Buffer for next leg
        currentHour = Math.floor((departureTotalMin + paceConfig.visitBufferMin) / 60);
        currentMinute = (departureTotalMin + paceConfig.visitBufferMin) % 60;

        const reason = this.explanation.explain(selected.candidate, {
          matchedCategory: selected.candidate.categoryName,
          distanceFromPreviousKm: distanceKm,
          availableMinutes: paceConfig.maxDayMinutes - (dayTravelMin + dayVisitMin),
          isFirstStop: stops.length === 0,
        });

        stops.push({
          placeId: selected.candidate.placeId,
          experienceId: selected.candidate.experienceId,
          name: selected.candidate.name,
          slug: selected.candidate.slug,
          latitude: selected.candidate.latitude,
          longitude: selected.candidate.longitude,
          sequence: stops.length + 1,
          arrivalTime,
          departureTime,
          travelFromPreviousMin: travelMin,
          visitDurationMin: visitMin,
          estimatedCost: selected.candidate.estimatedCost,
          reason,
          isLocked: false,
        });

        dayDistanceKm += distanceKm;
        dayTravelMin += travelMin;
        dayVisitMin += visitMin;
        dayCost += selected.candidate.estimatedCost;

        currentLoc = selected.candidate;
      }

      // Next day starts from the last stop of the previous day
      if (stops.length > 0) {
        dayOrigin = stops[stops.length - 1];
      }

      const dayStartH = String(paceConfig.defaultStartHour).padStart(2, '0');
      const dayEndH = String(Math.min(22, paceConfig.defaultStartHour + Math.ceil((dayTravelMin + dayVisitMin) / 60))).padStart(2, '0');

      generatedDays.push({
        date: dateString,
        sequence: dayNumber,
        startTime: `${dayStartH}:00`,
        endTime: `${dayEndH}:00`,
        distanceKm: Math.round(dayDistanceKm * 10) / 10,
        travelMinutes: dayTravelMin,
        visitMinutes: dayVisitMin,
        estimatedCost: Math.round(dayCost * 100) / 100,
        stops,
      });

      overallDistanceKm += dayDistanceKm;
      overallDurationMin += dayTravelMin + dayVisitMin;
      overallCost += dayCost;
    }

    return {
      status: 'READY',
      totalDistanceKm: Math.round(overallDistanceKm * 10) / 10,
      totalDurationMin: overallDurationMin,
      estimatedCost: Math.round(overallCost * 100) / 100,
      days: generatedDays,
    };
  }
}
