import { FeasibilityService } from './feasibility.service';
import { PlanningCandidate } from './planner.types';

describe('FeasibilityService', () => {
  let service: FeasibilityService;

  const validCandidate: PlanningCandidate = {
    placeId: 'place-1',
    name: 'Chitrakote Falls',
    slug: 'chitrakote-falls',
    latitude: 19.201,
    longitude: 81.701,
    visitDurationMin: 60,
    estimatedCost: 500,
    categoryIds: ['nature'],
    accessibility: true,
    seasonalAvailable: true,
    rating: 4.8,
    reviewCount: 15,
    isPublished: true,
    isPublic: true,
  };

  beforeEach(() => {
    service = new FeasibilityService();
  });

  it('accepts an eligible candidate', () => {
    expect(
      service.isEligible(validCandidate, {
        remainingBudget: 1000,
        remainingMinutes: 120,
        accessibilityRequired: false,
      }),
    ).toBe(true);
  });

  it('rejects unpublished candidates', () => {
    expect(
      service.isEligible(
        { ...validCandidate, isPublished: false },
        {
          remainingBudget: 1000,
          remainingMinutes: 120,
          accessibilityRequired: false,
        },
      ),
    ).toBe(false);
  });

  it('rejects private candidates', () => {
    expect(
      service.isEligible(
        { ...validCandidate, isPublic: false },
        {
          remainingBudget: 1000,
          remainingMinutes: 120,
          accessibilityRequired: false,
        },
      ),
    ).toBe(false);
  });

  it('rejects out of bounds coordinates', () => {
    expect(
      service.isEligible(
        { ...validCandidate, latitude: 10.0 }, // outside CG
        {
          remainingBudget: 1000,
          remainingMinutes: 120,
          accessibilityRequired: false,
        },
      ),
    ).toBe(false);
  });

  it('rejects seasonally unavailable candidates', () => {
    expect(
      service.isEligible(
        { ...validCandidate, seasonalAvailable: false },
        {
          remainingBudget: 1000,
          remainingMinutes: 120,
          accessibilityRequired: false,
        },
      ),
    ).toBe(false);
  });

  it('rejects budget overflow', () => {
    expect(
      service.isEligible(validCandidate, {
        remainingBudget: 100, // less than 500
        remainingMinutes: 120,
        accessibilityRequired: false,
      }),
    ).toBe(false);
  });

  it('rejects visit duration exceeding remaining minutes', () => {
    expect(
      service.isEligible(validCandidate, {
        remainingBudget: 1000,
        remainingMinutes: 30, // less than 60
        accessibilityRequired: false,
      }),
    ).toBe(false);
  });

  it('rejects inaccessible place when accessibility is required', () => {
    expect(
      service.isEligible(
        { ...validCandidate, accessibility: false },
        {
          remainingBudget: 1000,
          remainingMinutes: 120,
          accessibilityRequired: true,
        },
      ),
    ).toBe(false);
  });

  it('rejects explicitly excluded place', () => {
    expect(
      service.isEligible(validCandidate, {
        remainingBudget: 1000,
        remainingMinutes: 120,
        accessibilityRequired: false,
        excludedPlaceIds: new Set(['place-1']),
      }),
    ).toBe(false);
  });
});
