import { Injectable, Logger } from '@nestjs/common';
import { AiPlannerService } from './ai-planner.interface';
import { GeneratedItinerary, PlanningRequest } from '../engine/planner.types';

@Injectable()
export class DefaultAiPlannerService implements AiPlannerService {
  private readonly logger = new Logger(DefaultAiPlannerService.name);

  async explain(itinerary: GeneratedItinerary): Promise<string> {
    const totalStops = itinerary.days.reduce((acc, d) => acc + d.stops.length, 0);
    const dayCount = itinerary.days.length;

    const narrative = [
      `Your custom ${dayCount}-day journey across Chhattisgarh covers ${Math.round(itinerary.totalDistanceKm)} km and ${totalStops} curated destinations.`,
    ];

    itinerary.days.forEach((day) => {
      const stopNames = day.stops.map((s) => s.name).join(' → ');
      narrative.push(
        `Day ${day.sequence} explores ${day.stops.length} stops (${stopNames}) with an estimated ${day.travelMinutes} minutes of scenic travel.`,
      );
    });

    return narrative.join('\n\n');
  }

  async refine(
    itinerary: GeneratedItinerary,
    _request: PlanningRequest,
  ): Promise<GeneratedItinerary> {
    // Deterministic preservation: AI refinement only enriches narrative descriptions,
    // never adds unknown places, fake coordinates, or hallucinated rates.
    return itinerary;
  }
}
