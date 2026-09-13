import { Injectable } from '@nestjs/common';
import { PlanningCandidate } from './planner.types';

export interface FeasibilityContext {
  remainingBudget: number;
  remainingMinutes: number;
  accessibilityRequired: boolean;
  travelMonth?: number; // 1-12
  excludedPlaceIds?: Set<string>;
}

@Injectable()
export class FeasibilityService {
  // Bounding box for Chhattisgarh: 17.5N - 24.5N, 80.0E - 84.8E
  private static readonly MIN_LAT = 17.5;
  private static readonly MAX_LAT = 24.5;
  private static readonly MIN_LNG = 80.0;
  private static readonly MAX_LNG = 84.8;

  isEligible(
    candidate: PlanningCandidate,
    context: FeasibilityContext,
  ): boolean {
    // 1. Must be published & public
    if (candidate.isPublished === false || candidate.isPublic === false) {
      return false;
    }

    // 2. Coordinates must be within Chhattisgarh bounding box
    if (
      candidate.latitude < FeasibilityService.MIN_LAT ||
      candidate.latitude > FeasibilityService.MAX_LAT ||
      candidate.longitude < FeasibilityService.MIN_LNG ||
      candidate.longitude > FeasibilityService.MAX_LNG
    ) {
      return false;
    }

    // 3. Excluded places
    if (context.excludedPlaceIds && context.excludedPlaceIds.has(candidate.placeId)) {
      return false;
    }

    // 4. Seasonal availability
    if (candidate.seasonalAvailable === false) {
      return false;
    }

    // 5. Budget constraints
    if (candidate.estimatedCost > context.remainingBudget) {
      return false;
    }

    // 6. Time constraints (candidate visit duration cannot exceed remaining daily minutes)
    if (candidate.visitDurationMin > context.remainingMinutes) {
      return false;
    }

    // 7. Accessibility constraints
    if (context.accessibilityRequired && candidate.accessibility !== true) {
      return false;
    }

    return true;
  }
}
