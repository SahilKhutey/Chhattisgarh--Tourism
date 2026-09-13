import { ExplanationService } from './explanation.service';
import { PlanningCandidate } from './planner.types';

describe('ExplanationService', () => {
  let service: ExplanationService;

  const candidate: PlanningCandidate = {
    placeId: 'p-1',
    name: 'Tirathgarh Falls',
    slug: 'tirathgarh-falls',
    latitude: 18.91,
    longitude: 81.86,
    visitDurationMin: 90,
    estimatedCost: 200,
    categoryIds: ['nature', 'waterfalls'],
    categoryName: 'Waterfalls',
    accessibility: true,
    seasonalAvailable: true,
    rating: 4.7,
    reviewCount: 24,
    isPublished: true,
    isPublic: true,
  };

  beforeEach(() => {
    service = new ExplanationService();
  });

  it('generates fact-based explainable reason for a stop', () => {
    const reason = service.explain(candidate, {
      matchedCategory: 'Nature',
      distanceFromPreviousKm: 15,
      isFirstStop: false,
    });

    expect(reason).toContain('Matches your Nature interest');
    expect(reason).toContain('Located close to previous stop');
    expect(reason).toContain('Highly rated (4.7/5)');
  });

  it('generates first stop explanation appropriately', () => {
    const reason = service.explain(candidate, {
      isFirstStop: true,
    });

    expect(reason).toContain('Optimal starting destination for the day');
  });
});
