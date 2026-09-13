import { Injectable } from '@nestjs/common';
import { PlanningCandidate } from './planner.types';

export interface ExplanationContext {
  matchedCategory?: string;
  distanceFromPreviousKm?: number;
  availableMinutes?: number;
  travelerBudget?: number;
  isFirstStop?: boolean;
}

@Injectable()
export class ExplanationService {
  explain(candidate: PlanningCandidate, context: ExplanationContext): string {
    const reasons: string[] = [];

    if (context.matchedCategory) {
      reasons.push(`Matches your ${context.matchedCategory} interest`);
    } else if (candidate.categoryName) {
      reasons.push(`Popular ${candidate.categoryName} landmark`);
    }

    if (context.distanceFromPreviousKm !== undefined && context.distanceFromPreviousKm > 0) {
      if (context.distanceFromPreviousKm <= 25) {
        reasons.push(`Located close to previous stop (~${Math.round(context.distanceFromPreviousKm)} km)`);
      } else {
        reasons.push(`Connected along route (~${Math.round(context.distanceFromPreviousKm)} km)`);
      }
    } else if (context.isFirstStop) {
      reasons.push('Optimal starting destination for the day');
    }

    if (candidate.rating >= 4.0 && candidate.reviewCount > 0) {
      reasons.push(`Highly rated (${candidate.rating.toFixed(1)}/5)`);
    }

    if (candidate.visitDurationMin) {
      reasons.push(`Fits ${candidate.visitDurationMin}m visit window`);
    }

    if (reasons.length === 0) {
      return 'Verified Chhattisgarh destination suited for this route';
    }

    return reasons.join(' · ');
  }
}
