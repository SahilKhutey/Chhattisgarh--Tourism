import { PlanningScoringService } from './scoring.service';

describe('PlanningScoringService', () => {
  let service: PlanningScoringService;

  beforeEach(() => {
    service = new PlanningScoringService();
  });

  it('returns a normalized score', () => {
    const score = service.score({
      preferenceMatch: 1,
      geographicEfficiency: 1,
      experienceQuality: 1,
      timeCompatibility: 1,
      budgetCompatibility: 1,
    });

    expect(score).toBe(1);
  });

  it('weights preference most strongly (40%)', () => {
    const score = service.score({
      preferenceMatch: 1,
      geographicEfficiency: 0,
      experienceQuality: 0,
      timeCompatibility: 0,
      budgetCompatibility: 0,
    });

    expect(score).toBe(0.4);
  });

  it('correctly weights geographic efficiency (25%)', () => {
    const score = service.score({
      preferenceMatch: 0,
      geographicEfficiency: 1,
      experienceQuality: 0,
      timeCompatibility: 0,
      budgetCompatibility: 0,
    });

    expect(score).toBe(0.25);
  });
});
