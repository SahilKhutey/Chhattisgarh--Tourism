import { BadRequestException } from '@nestjs/common';
import { PlanningEngineService } from './planning-engine.service';
import { FeasibilityService } from './feasibility.service';
import { PlanningScoringService } from './scoring.service';
import { SequencingService } from './sequencing.service';
import { TravelTimeService } from './time.service';
import { ExplanationService } from './explanation.service';
import { PlanningCandidate, PlanningRequest } from './planner.types';

describe('PlanningEngineService', () => {
  let service: PlanningEngineService;

  const mockCandidates: PlanningCandidate[] = [
    {
      placeId: 'place-1',
      name: 'Chitrakote Falls',
      slug: 'chitrakote-falls',
      latitude: 19.201,
      longitude: 81.701,
      visitDurationMin: 120,
      estimatedCost: 100,
      categoryIds: ['nature', 'waterfalls'],
      categoryName: 'Nature',
      accessibility: true,
      seasonalAvailable: true,
      rating: 4.9,
      reviewCount: 50,
      isPublished: true,
      isPublic: true,
    },
    {
      placeId: 'place-2',
      name: 'Danteshwari Temple',
      slug: 'danteshwari-temple',
      latitude: 18.896,
      longitude: 81.352,
      visitDurationMin: 90,
      estimatedCost: 50,
      categoryIds: ['heritage', 'temple'],
      categoryName: 'Heritage',
      accessibility: true,
      seasonalAvailable: true,
      rating: 4.6,
      reviewCount: 30,
      isPublished: true,
      isPublic: true,
    },
    {
      placeId: 'place-3',
      name: 'Tirathgarh Falls',
      slug: 'tirathgarh-falls',
      latitude: 18.91,
      longitude: 81.86,
      visitDurationMin: 90,
      estimatedCost: 80,
      categoryIds: ['nature', 'waterfalls'],
      categoryName: 'Nature',
      accessibility: false,
      seasonalAvailable: true,
      rating: 4.7,
      reviewCount: 40,
      isPublished: true,
      isPublic: true,
    },
    {
      placeId: 'place-unpublished',
      name: 'Secret Cave',
      slug: 'secret-cave',
      latitude: 19.0,
      longitude: 81.5,
      visitDurationMin: 60,
      estimatedCost: 0,
      categoryIds: ['adventure'],
      accessibility: false,
      seasonalAvailable: true,
      rating: 3.0,
      reviewCount: 0,
      isPublished: false, // UNPUBLISHED
      isPublic: false,
    },
  ];

  const baseRequest: PlanningRequest = {
    tripId: 'trip-1',
    startDate: new Date('2026-10-01'),
    endDate: new Date('2026-10-03'), // 2 days
    travelers: 2,
    pace: 'BALANCED',
    categories: ['nature'],
    origin: { latitude: 19.076, longitude: 82.025 }, // Jagdalpur
  };

  beforeEach(() => {
    const timeService = new TravelTimeService();
    service = new PlanningEngineService(
      new FeasibilityService(),
      new PlanningScoringService(),
      new SequencingService(timeService),
      timeService,
      new ExplanationService(),
    );
  });

  it('excludes unpublished and private places', () => {
    const result = service.generate(mockCandidates, baseRequest);
    const stopIds = result.days.flatMap((d) => d.stops.map((s) => s.placeId));
    expect(stopIds).not.toContain('place-unpublished');
  });

  it('preserves required places', () => {
    const result = service.generate(mockCandidates, {
      ...baseRequest,
      requiredPlaceIds: ['place-2'],
    });

    const stopIds = result.days.flatMap((d) => d.stops.map((s) => s.placeId));
    expect(stopIds).toContain('place-2');
  });

  it('excludes explicitly excluded places', () => {
    const result = service.generate(mockCandidates, {
      ...baseRequest,
      excludedPlaceIds: ['place-1'],
    });

    const stopIds = result.days.flatMap((d) => d.stops.map((s) => s.placeId));
    expect(stopIds).not.toContain('place-1');
  });

  it('respects accessibility requirement', () => {
    const result = service.generate(mockCandidates, {
      ...baseRequest,
      accessibilityRequired: true,
    });

    const stopIds = result.days.flatMap((d) => d.stops.map((s) => s.placeId));
    expect(stopIds).not.toContain('place-3'); // place-3 is accessibility: false
  });

  it('produces completely deterministic output for same inputs', () => {
    const run1 = service.generate(mockCandidates, baseRequest);
    const run2 = service.generate(mockCandidates, baseRequest);

    expect(run1).toEqual(run2);
  });

  it('throws NO_FEASIBLE_ITINERARY if all candidates are filtered out', () => {
    expect(() =>
      service.generate(
        mockCandidates.filter((c) => !c.isPublished), // only unpublished
        baseRequest,
      ),
    ).toThrow(BadRequestException);
  });
});
