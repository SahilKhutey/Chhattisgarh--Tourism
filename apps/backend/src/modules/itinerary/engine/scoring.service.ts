import { Injectable } from '@nestjs/common';
import { PlanningScoreBreakdown } from './planner.types';

@Injectable()
export class PlanningScoringService {
  private static readonly WEIGHTS = {
    preferenceMatch: 0.40,
    geographicEfficiency: 0.25,
    experienceQuality: 0.15,
    timeCompatibility: 0.10,
    budgetCompatibility: 0.10,
  };

  score(candidate: PlanningScoreBreakdown): number {
    const raw =
      candidate.preferenceMatch * PlanningScoringService.WEIGHTS.preferenceMatch +
      candidate.geographicEfficiency * PlanningScoringService.WEIGHTS.geographicEfficiency +
      candidate.experienceQuality * PlanningScoringService.WEIGHTS.experienceQuality +
      candidate.timeCompatibility * PlanningScoringService.WEIGHTS.timeCompatibility +
      candidate.budgetCompatibility * PlanningScoringService.WEIGHTS.budgetCompatibility;

    return Math.round(Math.max(0, Math.min(1, raw)) * 1000) / 1000;
  }
}
