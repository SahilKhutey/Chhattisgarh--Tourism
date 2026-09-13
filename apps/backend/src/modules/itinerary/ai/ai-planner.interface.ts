import { GeneratedItinerary, PlanningRequest } from '../engine/planner.types';

export interface AiPlannerService {
  explain(itinerary: GeneratedItinerary): Promise<string>;
  refine(
    itinerary: GeneratedItinerary,
    request: PlanningRequest,
  ): Promise<GeneratedItinerary>;
}
